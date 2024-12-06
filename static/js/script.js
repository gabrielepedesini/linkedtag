//retrieve hashtags function
document.getElementById('post-form').addEventListener('submit', () => {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    cleanTitle = title.normalize('NFKD').replace(/(\r\n|\n|\r)/gm, ' ').replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '');
    cleanContent = content.normalize('NFKD').replace(/(\r\n|\n|\r)/gm, ' ').replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '');

    fetch('/generate-hashtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `title=${cleanTitle}&content=${cleanContent}`
    })
    .then(response => response.json())
    .then(data => {
        const table = document.getElementById('results-table');
        const tbody = table.querySelector('tbody');
        const copyBtn = document.getElementById('copy-btn');
        const copyOut = document.getElementById('copy-output');
        tbody.innerHTML = '';
        copyOut.innerText = '';

        if (data.length > 0) {
            table.style.display = 'table';
            copyBtn.style.display = 'block';

            data.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><input type="checkbox" value="${'#' + row.hashtag}" checked></td>
                    <td>${'#' + row.hashtag}</td>
                    <td>${row.followers}</td>
                    <td>${(row.score * 100).toFixed(1) + '%'}</td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            table.style.display = 'none';
            alert('No matching hashtags found!');
        }
    });
});

//copy selected hashtags to clipboard
const copyBtn = document.getElementById('copy-btn');
const copyOut = document.getElementById('copy-output');

copyBtn.addEventListener('click', () => {
    const hashtags = document.querySelectorAll('input[type="checkbox"]:checked');

    let buffer = '';

    hashtags.forEach(el => {
        buffer += el.value + " ";
    })

    copyOut.style.display = 'block';

    //copy to clipboard
    navigator.clipboard.writeText(buffer)
        .then(() => {
            copyOut.innerText = 'Copied!'
        })
        .catch(err => {
            copyOut.innerText = 'Error!'
        });
})