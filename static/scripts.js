document.addEventListener('DOMContentLoaded', () => {
    console.log('JavaScript is working!');
});

async function check_db() {
    let supaclient = supabase.createClient('https://srhywkedxssxlsjrholj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaHl3a2VkeHNzeGxzanJob2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzOTYxNjUsImV4cCI6MjA0MTk3MjE2NX0.lUZUAm20JIH3aoUxmyCAcr8l-A3_S3FpTaHuljrwm50')
    supaclient
    .from('credentials')
    .select('*')
    .then(({ data, error }) => {
      if (error) {
        console.error('Error fetching credentials:', error.message);
      } else {
        console.log('Credentials:', data);
      }
    });
}

async function fetchCredentials() {
    let supaclient = supabase.createClient('https://srhywkedxssxlsjrholj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaHl3a2VkeHNzeGxzanJob2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzOTYxNjUsImV4cCI6MjA0MTk3MjE2NX0.lUZUAm20JIH3aoUxmyCAcr8l-A3_S3FpTaHuljrwm50')
try {
    const { data, error } = await supaclient.from('credentials').select('*');
    if (error) throw error;
    console.log(data);
} catch (error) {
    console.error(error);
}
}


// fetchCredentials()
check_db()