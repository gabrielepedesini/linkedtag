//calculate numbers of chars in text areas
const textAreas = document.querySelectorAll('textarea');

window.addEventListener('load', () => {
    textAreas.forEach((element) => {

        let id = element.id;
        const counter = document.getElementById('counter-' + id);
        let charCount = element.value.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        let maxLength = element.maxLength.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
        counter.textContent = charCount + ' / ' + maxLength;
    });
})

textAreas.forEach((element) => {
    element.addEventListener('input', (el) => {
      
        let id = el.target.id;
        const counter = document.getElementById('counter-' + id);
        let charCount = el.target.value.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        let maxLength = el.target.maxLength.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        counter.textContent = charCount + ' / ' + maxLength;

    });
});

//error if form is invalid
const form = document.getElementById('post-form');
const textArea = document.getElementById("content");
const formBtn = document.querySelector("button[type='submit']");

formBtn.addEventListener("click", () => {
    if (textArea.value.length == 0) {
        form.classList.add("submitted");
    }
});

//number of rows adjustments
form.addEventListener("input", () => {
    form.classList.remove("submitted");
});

function adjustTextareaRows() {
    const textarea = document.getElementById("title");
    
    textarea.setAttribute("rows", "1");

    if (window.innerWidth < 800) {
        textarea.setAttribute("rows", "2");
    } if (window.innerWidth < 425) {
        textarea.setAttribute("rows", "3"); 
    }
}

window.addEventListener("resize", adjustTextareaRows);
window.addEventListener("DOMContentLoaded", adjustTextareaRows);

//retrieve hashtags function
document.getElementById('post-form').addEventListener('submit', () => {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    cleanTitle = title.normalize('NFKD').replace(/(\r\n|\n|\r)/gm, ' ').replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '');
    cleanContent = content.normalize('NFKD').replace(/(\r\n|\n|\r)/gm, ' ').replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '');

    formBtn.innerHTML = '<img src="../static/img/icons/loader.svg" alt=""> Searching...';
    formBtn.classList.add('rotate-icon');
    formBtn.style.pointerEvents = 'none';
    
    fetch('/generate-hashtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `title=${cleanTitle}&content=${cleanContent}`
    })
    .then(response => {
        if (!response.ok) {
            throw new Error();
        }
        return response.json();
    })
    .then(data => {
        const sectionHero = document.querySelector('section.hero');
        const sectionTable = document.querySelector('section.table');
        const shapeDiv = document.querySelector('.custom-shape-divider');
        const tableContainer = document.querySelector('.container.table');
        const tableWrapper = document.getElementById('table-wrapper'); 
        const table = document.getElementById('results-table');
        const tbody = table.querySelector('tbody');
        const copyBtn = document.getElementById('copy-btn');
        const footer = document.querySelector('footer');

        tbody.innerHTML = '';

        if (data.length > 0) {

            data.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><input type="checkbox" value="${'#' + row.hashtag}" checked></td>
                    <td>${'#' + row.hashtag}</td>
                    <td>${row.followers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
                    <td>${(row.score * 100).toFixed(1) + '%'}</td>
                `;
                tbody.appendChild(tr);
            });

            tableWrapper.style.display = 'block';
            table.style.display = 'table';
            copyBtn.style.display = 'flex';
            tableContainer.style.display = 'block';
            sectionHero.style.minHeight = 'calc(100vh + 300px)';
            sectionHero.style.paddingBottom = '300px';
            sectionTable.style.height = `${tableWrapper.offsetHeight}px`;
            shapeDiv.style.display = 'block';
            footer.style.display = 'flex';

            setTimeout(() => {
                tableWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' }); 

                formBtn.innerHTML = '<img src="../static/img/icons/search.svg" alt=""> Find Hashtags';
                formBtn.classList.remove('rotate-icon');
                formBtn.style.pointerEvents = 'all';
            }, 200);

        } else {

            tableWrapper.style.display = 'none';
            table.style.display = 'none';
            copyBtn.style.display = 'none';
            sectionHero.style.minHeight = '100vh';
            sectionHero.style.paddingBottom = '0px';
            sectionTable.style.height = `0px`;
            shapeDiv.style.display = 'none';
            footer.style.display = 'none';

            formBtn.innerHTML = '<img src="../static/img/icons/search.svg" alt=""> Find Hashtags';
            formBtn.classList.remove('rotate-icon');
            formBtn.style.pointerEvents = 'all';

            noHashtagFound();

        }
    })
    .catch(error => {
        formBtn.innerHTML = '<img src="../static/img/icons/x.svg" alt=""> Error Occurred';
        formBtn.classList.remove('rotate-icon');
        formBtn.classList.add('error');

        setTimeout(() => {
            formBtn.innerHTML = '<img src="../static/img/icons/search.svg" alt=""> Find Hashtags';
            formBtn.classList.remove('error');
            formBtn.style.pointerEvents = 'all';
        }, 3000);
    });
});

//no hashtags found 
const popupContainer = document.querySelector('.blur-background');
const popupHashtag = document.querySelector('.no-hashtag-container');
const closePopupHashtagBtn = document.querySelector('.no-hashtag-container .x');

function noHashtagFound() {
    popupContainer.style.display = 'block';
    popupHashtag.style.display = 'flex';
}

popupContainer.addEventListener('click', () => {
    popupContainer.style.display = 'none';
    popupHashtag.style.display = 'none';
})

closePopupHashtagBtn.addEventListener('click', () => {
    popupContainer.style.display = 'none';
    popupHashtag.style.display = 'none';
})

//how to use it
const linkHowTo = document.querySelector('.link-how-to-use-it');
const popupHowTo = document.querySelector('.how-to-use-it');
const closePopupHowToBtn = document.querySelector('.how-to-use-it .x');

linkHowTo.addEventListener('click', () => {
    popupContainer.style.display = 'block';
    popupHowTo.style.display = 'flex';
})

popupContainer.addEventListener('click', () => {
    popupContainer.style.display = 'none';
    popupHowTo.style.display = 'none';
})

closePopupHowToBtn.addEventListener('click', () => {
    popupContainer.style.display = 'none';
    popupHowTo.style.display = 'none';
})


//copy selected hashtags to clipboard
const copyBtn = document.getElementById('copy-btn');

copyBtn.addEventListener('click', () => {
    const hashtags = document.querySelectorAll('input[type="checkbox"]:checked');

    let buffer = '';

    hashtags.forEach(el => {
        buffer += el.value + " ";
    })

    //copy to clipboard
    navigator.clipboard.writeText(buffer)
        .then(() => {
            if (buffer.length !== 0) {
                copyBtn.innerHTML = '<img src="../static/img/icons/check.svg" alt=""> Copied!';
    
                copyBtn.classList.add('correct');
    
                setTimeout(() => {
                    copyBtn.classList.remove('correct');
                    copyBtn.innerHTML = '<img src="../static/img/icons/copy.svg" alt=""> Copy Selected Hashtags';
                }, 3000);
            } else {
                copyBtn.innerHTML = '<img src="../static/img/icons/x.svg" alt=""> No Hashtag Selected!';

                copyBtn.classList.add('error');

                setTimeout(() => {
                    copyBtn.classList.remove('error');
                    copyBtn.innerHTML = '<img src="../static/img/icons/copy.svg" alt=""> Copy Selected Hashtags';
                }, 3000);
            }
        })
        .catch(err => {
            copyBtn.innerHTML = '<img src="../static/img/icons/x.svg" alt=""> Error!';

            copyBtn.classList.add('error');

            setTimeout(() => {
                copyBtn.classList.remove('error');
                copyBtn.innerHTML = '<img src="../static/img/icons/copy.svg" alt=""> Copy Selected Hashtags';
            }, 3000);
        });
})