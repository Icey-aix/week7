console.log('Client is working');

// 等 DOM 就绪
window.addEventListener("load", function () {
  const feed = document.querySelector('#feed');
  const msgInput = document.querySelector('#msg-input');
  const button = document.querySelector('#msg-submit');

  // --------- 工具函数：渲染消息列表 ---------
  function renderMessages(list) {
    feed.innerHTML = '';
    (list || []).forEach(item => {
      const p = document.createElement('p');
      p.textContent = item.message; // 用 textContent 更安全
      feed.appendChild(p);
    });
  }

  // --------- 第一次加载：GET /data ---------
  function loadAll() {
    fetch('/data')
      .then(res => res.json())
      .then(payload => {
        console.log('GET /data ->', payload);
        renderMessages(payload.data);
      })
      .catch(console.error);
  }
  loadAll();

  // --------- 点击发送：POST /new-data -> 再 GET /data ---------
  button.addEventListener('click', function () {
    console.log('The button was clicked');

    const value = (msgInput.value || '').trim();
    if (!value) return; // 防空

    const msgObjectJSON = JSON.stringify({ message: value });
    console.log('POST body:', msgObjectJSON);

    fetch('/new-data', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: msgObjectJSON
    })
      .then(res => res.json())
      .then(result => {
        console.log('POST /new-data ->', result);
        if (!result.success) throw new Error(result.error || 'Failed');
        msgInput.value = '';
        return fetch('/data');           // 重新拉取最新数据
      })
      .then(res => res.json())
      .then(payload => {
        console.log('Refetched /data ->', payload);
        renderMessages(payload.data);
      })
      .catch(console.error);
  });
});
