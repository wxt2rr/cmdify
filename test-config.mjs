import { cosmiconfig } from 'cosmiconfig';

(async () => {
  // 指定搜索路径
  const explorer = cosmiconfig('cmdify', {
    searchPlaces: ['.config.json', '~/.cmdify/config.json'],
  });

  const result = await explorer.search();

  console.log('result:', result);
  console.log('result.config:', result?.config);
  console.log('result.config.llm:', result?.config?.llm);
  console.log('result.config.llllm.apiKey:', result?.config?.llm?.apiKey);
})();
