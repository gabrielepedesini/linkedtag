document.getElementById('post-form').addEventListener('submit', () => {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    cleanTitle = title.normalize('NFKD').replace(/(\r\n|\n|\r)/gm, ' ').replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '');
    cleanContent = content.normalize('NFKD').replace(/(\r\n|\n|\r)/gm, ' ').replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '');

    console.log(cleanContent)

    fetch('/generate-hashtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `title=${cleanTitle}&content=${cleanContent}`
    })
    .then(response => response.json())
    .then(data => {
        const table = document.getElementById('results-table');
        const tbody = table.querySelector('tbody');
        tbody.innerHTML = '';

        if (data.length > 0) {
            table.style.display = 'table';

            data.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
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