// Supabase Edge Function for handling Stripe webhooks
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.38.0';
import Stripe from 'npm:stripe@13.2.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async req => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Get Stripe secret key and webhook secret from environment variables
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!stripeKey || !endpointSecret) {
      throw new Error('Missing required environment variables');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the request body as text for verification
    const payload = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      throw new Error('Missing Stripe signature');
    }

    // Verify the event
    const event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);

    // Handle different event types
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Update invoice and job status
      if (session.metadata?.invoice_id) {
        const invoiceId = session.metadata.invoice_id;
        const jobId = session.metadata.job_id;

        // Update invoice status
        await supabase
          .from('invoices')
          .update({
            paid_at: new Date().toISOString(),
            payment_method: 'stripe',
          })
          .eq('id', invoiceId);

        // Update job status to paid
        if (jobId) {
          await supabase.from('jobs').update({ status: 'paid' }).eq('id', jobId);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error handling webhook:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
