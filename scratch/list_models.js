async function list() {
  const key = 'AIzaSyDnS_ZYCYE39Zva5MGTk4qUFrx60VQ8BIg';
  try {
    const url = "https://generativelanguage.googleapis.com/v1beta/models?key=" + key;
    const response = await fetch(url);
    const data = await response.json();
    if (data.models) {
      console.log("Success! Found models:", data.models.map(m => m.name));
    } else {
      console.log("Response:", JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.log("Error:", e.message);
  }
}
list();
