let step_tracker = 0;
let sectionNum = 0;
let difficulty_tracker = 0;

function loadTutorial() {

    // Create difficulty title
    const difficultyContainer = document.querySelector('.difficulty-container');
    const difficultyElm = document.createElement('h4');
    difficultyElm.innerText = 'Difficulty:';
    difficultyContainer.appendChild(difficultyElm);

    fetch('info.json').then(resp => {
        return resp.json();
    }).then(async data => {
        setDifficulty(data.difficulty);
        setTitle(data.title);
        const buttons = data.buttons;
        await addContent(buttons);
    })

    function setTitle(title) {
        // sectionTitle = title;
        const titleElm = document.getElementById('title');
        titleElm.textContent = title;
    }

    // Add content
    async function addContent(buttonsData) {

        sectionNum = buttonsData.length;

        const selectButtonsContainer = document.querySelector("#section-selection .flex-row");
        const sectionContainer = document.querySelector(".section-container");
        (async () => {
            for (let i = 0; i < sectionNum; i++) {
                const button = document.createElement('button');
                button.id = `selection-button-${i}`;
                button.setAttribute('onclick', `switchStep(${i})`);
                // button.addEventListener('click', () => switchStep(i));
                const buttonData = buttonsData[i];
                const buttonTitle = buttonData.title || `Step ${i}`;
                const description = buttonData.description || '';
                button.className = "no-squish";
                button.innerHTML = `
            <p class="step-title">${buttonTitle}</p>
            <p class="step-description">${description}<p>
            `;
                selectButtonsContainer.appendChild(button);
                if (i !== sectionNum - 1) {
                    const bar = document.createElement('div');
                    bar.className = "section-selection-bar";
                    selectButtonsContainer.appendChild(bar);
                }

                if (i === 0) {
                    button.focus();
                }

                const section = document.createElement('div');
                section.className = 'section';

                const resp = await fetch(`sections/section${i + 1}.html`);
                let page = await resp.text();
                if (!page || page === 'File not found') {
                    page = `<div>No content or an issue occurred during loading</div>`;
                }
                section.innerHTML = page;

                // Add tool lists
                const toolLists = section.querySelectorAll('.tool-list');
                for (list of toolLists) {
                    const tools = await listTools();
                    list.append(...tools);
                }

                sectionContainer.appendChild(section);
            }
        })();
    }
}

// Method for step switch buttons
function switchStep(step) {
    if (step >= sectionNum) {
        step = 0;
    }
    if (step < 0) {
        step = sectionNum - 1;
    }
    step_tracker = step;

    const container = document.querySelector('.section-container');
    container.style.left = `calc((100vw * ${-step} + var(--body-margin)))`;
    const button = document.getElementById(`selection-button-${step}`);
    button.focus();
}

function setDifficulty(difficulty, diffContainer) {
    difficulty_tracker = difficulty
    for (let i = 0; i < difficulty; i++) {
        const circle = document.createElement('div');
        const container = diffContainer || document.querySelector('.difficulty-container');
        circle.className = 'circle on';
        container.appendChild(circle);
    }

    for (let i = 0; i < 5 - difficulty; i++) {
        const circle = document.createElement('div');
        const container = diffContainer || document.querySelector('.difficulty-container');
        circle.className = 'circle off';
        container.appendChild(circle);
    }
}

async function listTools(path = 'info.json', undepth = 0) {

    /*

    <a href="https://runwayml.com" target="_blank">
    <div class="tool-icon">
        <img src="media/runway-logo.png" alt="Runway Icon">
        <p>Runway</p>
    </div>
    </a>

    */

    const info = await (await fetch(path)).json();
    if (info.toolList) {
        const tools = [];
        for (data of info.toolList) {

            const iconPath = data.image;
            const altName = data.name;
            const url = data.link

            const linkElement = document.createElement('a');
            linkElement.href = url;
            linkElement.target = '_blank';

            const divElement = document.createElement('div');
            divElement.classList.add('tool-icon');

            const imgElement = document.createElement('img');

            let pathPrefixToRemove = '../'.repeat(undepth);
            if (iconPath.startsWith(pathPrefixToRemove)) {
                imgElement.src = iconPath.slice(pathPrefixToRemove.length);
            } else {
                imgElement.src = iconPath;
            }

            imgElement.alt = altName;

            const pElement = document.createElement('p');
            pElement.textContent = altName;

            divElement.appendChild(imgElement);
            divElement.appendChild(pElement);

            linkElement.appendChild(divElement);

            tools.push(linkElement);
        }

        return tools;
    }
}