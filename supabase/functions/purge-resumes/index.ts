// Automatic resume deletion has been retired.
Deno.serve(() => new Response("Automatic deletion is disabled. Use admin manual deletion.", { status: 410 }));
