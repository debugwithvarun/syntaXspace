export async function fetchTechNews() {
    const API_KEY = process.env.VITE_GNEWS_API_KEY;
  
    if (!API_KEY) {
      console.error(" Missing GNews API key.");
      return []
    }
  
    const BASE_URL = "https://gnews.io/api/v4/search";
    const query = encodeURIComponent("programming OR technology OR social media");
    const maxPerPage = 50; 
    const desiredMin = 50; 
    let page = 1;
    let allArticles = [];
  
    try {
      while (allArticles.length < desiredMin) {
        const url = `${BASE_URL}?q=${query}&lang=en&country=in&max=${maxPerPage}&page=${page}&token=${API_KEY}`;
        const response = await fetch(url);
  
        if (!response.ok) {
          throw new Error(`GNews API error: ${response.status} ${response.statusText}`);
        }
  
        const data = await response.json();
        console.profile(data)

        if (!data.articles || data.articles.length === 0) {
          break;
        }
  
        allArticles.push(...data.articles);
  
        console.log(`📄 Page ${page}: fetched ${data.articles.length} articles (total: ${allArticles.length})`);
  
        page++;
      }
  

      allArticles = allArticles.slice(0, desiredMin);
  
      console.log(`✅ ${new Date().toLocaleString()} — Fetched total ${allArticles.length} news items.`);
      return allArticles;
    } catch (error) {
      console.error("❌ Error fetching news:", error);
      return [];
    }
  }
  