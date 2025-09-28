// CORS代理服务
// 如果需要访问真正的Excalidraw库，可以使用这些代理服务

export const CORS_PROXIES = [
  // 更可靠的CORS代理服务
  {
    name: 'AllOrigins',
    url: 'https://api.allorigins.win/raw?url=',
    headers: {}
  },
  {
    name: 'CORS Proxy',
    url: 'https://corsproxy.io/?',
    headers: {}
  },
  {
    name: 'Proxy CORS',
    url: 'https://proxy-cors.vercel.app/api/proxy?url=',
    headers: {}
  },
  {
    name: 'ThingProxy',
    url: 'https://thingproxy.freeboard.io/fetch/',
    headers: {}
  }
];

export async function fetchWithCorsProxy(url: string): Promise<Response> {
  console.log(`Attempting to fetch: ${url}`);
  
  // 首先尝试直接访问
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      console.log('Direct fetch successful');
      return response;
    }
  } catch (error) {
    console.log('Direct fetch failed, trying CORS proxies...', error);
  }

  // 如果直接访问失败，尝试使用代理
  for (const proxy of CORS_PROXIES) {
    try {
      console.log(`Trying proxy: ${proxy.name}`);
      const proxyUrl = proxy.url + encodeURIComponent(url);
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...proxy.headers
        },
      });
      
      if (response.ok) {
        console.log(`Successfully fetched via proxy: ${proxy.name}`);
        return response;
      } else {
        console.log(`Proxy ${proxy.name} returned status: ${response.status}`);
      }
    } catch (error) {
      console.log(`Proxy ${proxy.name} failed:`, error);
      continue;
    }
  }

  throw new Error('All CORS proxies failed');
}

// 专门为Excalidraw库设计的获取函数
export async function fetchExcalidrawLibrary(libraryUrl: string): Promise<any> {
  try {
    // 构建完整的URL
    const fullUrl = libraryUrl.startsWith('http') 
      ? libraryUrl 
      : `https://libraries.excalidraw.com${libraryUrl}`;
    
    console.log(`Fetching Excalidraw library: ${fullUrl}`);
    
    const response = await fetchWithCorsProxy(fullUrl);
    const data = await response.json();
    
    console.log('Excalidraw library loaded successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to fetch Excalidraw library:', error);
    throw error;
  }
}

// 使用示例：
// const response = await fetchWithCorsProxy('https://libraries.excalidraw.com/libraries/aretecode/basic-shapes.excalidrawlib');
// const data = await response.json();