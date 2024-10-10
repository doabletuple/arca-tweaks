// ==UserScript==
// @name         ArcaTweaks
// @version      1.0.0
// @description  A userscript to tweak arca.live
// @author       DoableTuple
// @match        https://arca.live/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://code.jquery.com/ui/1.13.0/jquery-ui.min.js
// @updateURL    https://github.com/doabletuple/arca-tweaks/releases/latest/download/ArcaTweaks.user.js
// @downloadURL  https://github.com/doabletuple/arca-tweaks/releases/latest/download/ArcaTweaks.user.js
// ==/UserScript==

"use strict";



const loggedIn = document.querySelector('span[class="username d-none d-sm-inline"]');
const myUsername = loggedIn ? loggedIn.innerText : null;

const slugMatch = window.location.href.match(/(?<=https:\/\/arca\.live\/b\/).*?(?=\/|\?|$)/);
const currentSlug = slugMatch ? slugMatch[0] : null;

const postAuthors = document.querySelectorAll('a[class="vrow column"] span[data-filter], a[class="vrow column active"] span[data-filter]');
let commentAuthors = document.querySelectorAll('div[class="comment-wrapper"] a[data-filter], div[class="comment-wrapper"] span[data-filter]');



// 모바일 환경인지 확인
function isMobile() {
    return window.matchMedia("(max-width: 767px)").matches;
}



// URL에서 쿼리 스트링 제거
function removeQueryString() {
    const urlList = document.querySelectorAll('a[href]');
    for (const url of urlList) {
        const href = url.getAttribute('href').match(/\/b\/.*?\/[0-9]*(?=\?)/);
        if (href !== null) {
            url.setAttribute('href', href[0]);
        }
    }
}
removeQueryString();



// 원하지 않는 요소 숨김
function hideJunks() {
    const junks = [
        'div[class="ad"]',
        'div[id="recentChange"]',
        'a.dropdown-item[href="/b/singbung?mode=best"]',
        'a.dropdown-item[href="/b/hotdeal"]',
        'a.dropdown-item[href="/b/headline"]',
        'a.dropdown-item[href="/b/replay"]',
        'a.dropdown-item[href="/b/breaking"]',
        'a.nav-link[href="https://namu.news"]',
        'a.nav-link[href="https://namu.wiki"]'
    ];
    for (const junk of junks) {
        for (const element of document.querySelectorAll(junk)) {
            element.style.display = 'none';
        }
    }
}
hideJunks();



// 원하지 않는 사이드바 요소 숨김
function hideSidebarItems() {
    const junks = {
        ['/b/' + currentSlug + '?mode=best']: false,
        '/b/hotdeal': true,
        '/b/singbung?mode=best': true
    };
    const sidebarItems = document.querySelectorAll('div[class="sidebar-item"]');
    for (const sidebarItem of sidebarItems) {
        const a = sidebarItem.querySelector('div[class="item-title"] a[href]');
        if (a !== null && junks[a.getAttribute('href')] === true) {
            sidebarItem.style.display = 'none';
        }
    }

    const hideLeafInfo = true;
    GM_addStyle(`
        .body .sidebar .sidebar-item .link-list a {
            ${hideLeafInfo ? 'padding-right: 0' : ''}
        }
        .body .leaf-info {
            ${hideLeafInfo ? 'display: none' : ''};
        }
    `);

    const namuNews = document.querySelector('div[class="sticky-container"]');
    namuNews.style.display = 'none';
}
hideSidebarItems();



// 게시글 ID 칼럼 숨김
function hidePostIds() {
    const articleList = document.querySelector('div.article-list');
    if (articleList !== null) {
        const header = document.querySelector('div[class="vrow column head d-none d-md-flex"] span[class="vcol col-id"]');
        const wrapper = document.createElement('b');
        wrapper.innerText = header.innerText;
        header.appendChild(wrapper);

        for (const childNode of header.childNodes) {
            if (childNode.nodeType === Node.TEXT_NODE) {
                childNode.remove();
            }
        }

        const postIdList = document.querySelectorAll('span[class="vcol col-id"]');
        for (const postId of postIdList) {
            postId.setAttribute('original-width', postId.offsetWidth);
            postId.style.width = '0';
        }

        const toggleButton = document.createElement('button');
        toggleButton.style.cssText = `
            padding: .3rem .3rem;
            margin: .3rem 0 .3rem 0;
            border-radius: 3px;
            border-color: var(--color-bd-outer);
            background-color: var(--color-bg-main);
            color: var(--color-text-color);
            text-align: center;
            font-family: inherit;
            font-size: 85%;
            line-height: inherit;
            `;
        toggleButton.innerText = '번호 칼럼 열기';

        let show = false;
        $(toggleButton).click(function() {
            show = !show;
            toggleButton.innerText = toggleButton.innerText === '번호 칼럼 열기' ? '번호 칼럼 닫기' : '번호 칼럼 열기'
            for (const postId of postIdList) {
                const originalWidth = postId.getAttribute('original-width');
                $(postId).animate({ width: `${show ? originalWidth : '0'}` });
            }
        })

        const tableList = articleList.querySelector('div.list-table');
        articleList.insertBefore(toggleButton, tableList);
    }
}
if (!isMobile()) {
    hidePostIds();
}



// 페이지의 너비 고정
function fixPageWidth() {
    GM_addStyle(`
        html[class*="width-"] .body .navbar-wrapper .navbar,
        html[class*="width-"] .body .content-wrapper {
            max-width: unset
        }
    `);
}
fixPageWidth();



// 사이드바의 너비 조절
function setSidebarWidth() {
    const w = 350;
    GM_addStyle(`
        @media screen and (max-width: 2000px) {
            html[class*="width-"] .body .content-wrapper {
                grid-template-columns: 1fr calc(${w}px + .75rem)
            }
            html[class*="width-"] .body .left-ad-area {
                display: none
            }
        }
        .toast {
            flex-basis: calc(${w}px + .75rem);
            max-width: calc(${w}px + .75rem)
        }
        .body #toastbox {
            padding: 0 .75rem 0 0;
            max-width: calc(${w}px + .75rem)
        }
    `);
}
setSidebarWidth();



// 네비게이션 바에 "스크랩 목록" 메뉴 추가
function navBarScrapMenu() {
    if (loggedIn) {
        const navMenu = document.querySelector('ul[class="nav navbar-nav ml-auto ml-lg-0"]');
        const notification = navMenu.querySelector('li[class="nav-item dropdown"]');
        const scrap = document.querySelector('div[class*="dropdown-menu user-dropdown-menu right"] a[href*="/u/scrap_list"]');

        const navScrapWrapper = document.createElement('li');
        navMenu.insertBefore(navScrapWrapper, notification);
        navScrapWrapper.setAttribute('class', 'nav-item d-block');

        const navScrap = scrap.cloneNode(true);
        navScrapWrapper.appendChild(navScrap);
        navScrap.setAttribute('class', 'nav-link');
    }
}
navBarScrapMenu();



// 글 목록 및 글쓰기 화면의 카테고리 UI 롤백
function categoryMod() {
    GM_addStyle(`
        .body .board-article .article-list .board-category-wrapper .board-category {
            flex-wrap: wrap;
            border-bottom: 1px solid var(--color-bd-outer)
        }
        .body .board-article .article-write .write-category-wrapper .write-category {
            display: flex;
            flex-wrap: wrap
        }
        .body .board-article .article-write .write-category-wrapper .write-category .item {
            display: flex
        }
        .body .board-article .article-list .board-category-wrapper .board-category .item::before,
        .body .board-article .article-list .board-category-wrapper .board-category .item::after {
            border-width: 0
        }
        .body .board-article .article-write .write-category-wrapper .write-category .item::before,
        .body .board-article .article-write .write-category-wrapper .write-category .item::after {
            content: "";
            width: .3rem
        }
        .body .board-article .article-list .board-category-wrapper .board-category .item a,
        .body .board-article .article-write .write-category-wrapper .write-category .item a {
            border: 0;
            border-radius: 1rem;
            padding: .2rem .5rem;
            margin: .3rem .1rem;
            color: var(--color-board-category-text);
            background-color: var(--color-board-category)
        }
        .body .board-article .article-write .write-category-wrapper .write-category .item a {
            cursor: pointer;
            text-decoration: none
        }
        .body .board-article .article-list .board-category-wrapper .board-category .item a.active,
        .body .board-article .article-write .write-category-wrapper .write-category .item a.active {
            background-color: var(--color-senkawa-green);
        }
        .body .board-article .article-list .board-category-wrapper .board-category .dummy {
            display: none
        }
    `);

    const categoryDropdown = document.querySelector('select[class="arca-select category-select"]');
    if (categoryDropdown !== null) {
        categoryDropdown.style.display = 'none';
        const selectedCategoryName = categoryDropdown.selectedOptions[0].getAttribute('value');

        const observer = new MutationObserver(function() {
            const script = document.querySelector('head script[type="text/javascript"]:not(:empty)');
            if (script !== null) {
                observer.disconnect();

                const config = JSON.parse(script.innerText.match(new RegExp(/(?<=^window\.LiveConfig=).*?(?=;$)/))[0])
                const defaultPlaceholder = config['placeholder']['article'];
                const placeholders = config['placeholder']['category'];

                const categoryMap = new Map();
                for (const category of categoryDropdown) {
                    const categoryName = category.getAttribute('value');
                    const useDefault = placeholders[categoryName] === undefined || placeholders[categoryName]['article'] === '';

                    categoryMap.set(categoryName, {
                        categoryName: category.label,
                        preventDelete: category.getAttribute('data-prevent-delete') === 'true',
                        placeholderText: useDefault ? defaultPlaceholder : placeholders[categoryName]['article']
                    });
                }

                const writeForm = document.querySelector('form[id="article_write_form"]');
                const categoryWrapper = document.createElement('div');
                writeForm.parentNode.insertBefore(categoryWrapper, writeForm);
                categoryWrapper.setAttribute('class', 'write-category-wrapper');

                const writeCategory = document.createElement('div');
                categoryWrapper.appendChild((writeCategory));
                writeCategory.setAttribute('class', 'write-category');

                for (const [categoryName, attributes] of categoryMap) {
                    const buttonWrapper = document.createElement('span');
                    writeCategory.appendChild(buttonWrapper);
                    buttonWrapper.setAttribute('class', 'item');

                    const newButton = document.createElement('a');
                    buttonWrapper.appendChild(newButton);
                    newButton.innerText = attributes['categoryName'];
                    if (categoryName === selectedCategoryName) {
                        newButton.setAttribute('class', 'active');
                    }
                    newButton.addEventListener('click', function() {
                        categoryDropdown.querySelector(`option[value="${categoryName}"]`).selected = true;
                        for (const button of writeCategory.querySelectorAll('a')) {
                            button.removeAttribute('class');
                        }
                        newButton.setAttribute('class', 'active');

                        const preventDelete = document.querySelector('div[id="formAgreePreventDelete"]');
                        preventDelete.style.display = attributes['preventDelete'] ? 'revert' : 'none';

                        const textField = document.querySelector('span[class*="fr-placeholder"]');
                        const temp = document.createElement('div');
                        temp.innerHTML = attributes['placeholderText'];
                        textField.innerText = temp.innerText;
                    });
                }
            }
        });
        observer.observe(document.body, { childList: true });
    }
}
categoryMod();



// 단축키 추가
function addHotkeys() {
    document.addEventListener('keydown',function(key) {
        const tagName = document.activeElement.tagName.toUpperCase();
        const inputIsActive =
            tagName === 'INPUT' ||
            tagName === 'TEXTAREA' ||
            document.activeElement.getAttribute('class') === 'fr-element fr-view';

        if (!inputIsActive && !key.ctrlKey) {
            if (currentSlug !== null) {
                switch (key.code) {
                    // Z 키로 현재 채널의 전체글로 이동
                    case 'KeyZ':
                        window.location.href = 'https://arca.live/b/' + currentSlug;
                        break;

                    // X 키로 현재 채널의 개념글로 이동
                    case 'KeyX':
                        if (document.querySelector('a.btn[href="/b/${currentSlug}?mode=best"]') !== null) {
                            window.location.href = 'https://arca.live/b/' + currentSlug + '?mode=best';
                        }
                        break;
                }
            }

            switch (key.code) {
                // Q 키로 알림 펼침/접음
                case 'KeyQ':
                    const notification = document.querySelector('a[title="Notification"]');
                    if (notification.parentNode.getAttribute('class') === 'nav-item dropdown') {
                        window.scrollTo(0, 0);
                    }
                    notification.click();
                    break;

                // B 키로 베스트 라이브로 이동
                case 'KeyB':
                    window.location.href = 'https://arca.live/b/live';
                    break;

                // F 키로 스크랩 목록으로 이동
                case 'KeyF':
                    window.location.href = 'https://arca.live/u/scrap_list';
                    break;

                // V 키로 댓글 작성창으로 스크롤
                case 'KeyV':
                    if (document.querySelector('div[id="comment"]') !== null) {
                        document.querySelector('div[id="comment"]').scrollIntoView({ block: 'end' });
                    }
            }
        }
    });
}
addHotkeys();



// 현재 유저의 글 및 댓글 강조
function highlightMe() {
    const highlightColor = '#47439D';

    for (const author of postAuthors) {
        if (author.innerText === myUsername) {
            author.style.fontWeight = 'bold';
            author.style.backgroundColor = highlightColor;
        }
    }

    for (const author of commentAuthors) {
        if (author.innerText === myUsername) {
            author.closest('div[class="info-row clearfix"]').style.fontWeight = 'bold';
            author.closest('div[class="info-row clearfix"]').style.backgroundColor = highlightColor;
        }
    }
}
highlightMe();



// 기본 이미지 토글 기능
function collapseDefaultImage() {
    const defaultImage = document.querySelector('div[id="defaultImage"]');
    if (defaultImage !== null) {
        const collapseButton = document.createElement('button');
        collapseButton.style.cssText = `
            padding: .3rem .3rem;
            margin-bottom: 1rem;
            border: 1px solid;
            border-radius: 3px;
            border-color: var(--color-bd-outer);
            background-color: var(--color-bg-main);
            color: var(--color-text-color);
            text-align: center;
            font-family: inherit;
            font-size: 85%;
            line-height: inherit;
            `;
        collapseButton.innerText = '기본 이미지 열기';

        $(collapseButton).click(function() {
            $(defaultImage).slideToggle();
            collapseButton.innerText = collapseButton.innerText === '기본 이미지 열기' ? '기본 이미지 닫기' : '기본 이미지 열기'
        });

        defaultImage.style.display = 'none';
        defaultImage.parentNode.insertBefore(collapseButton, defaultImage);
    }
}
collapseDefaultImage();



// 썸네일 낚시 이미지 표시 기능
function expandImage() {
    const media = document.querySelectorAll('div[class="fr-view article-content"] img[style], div[class="fr-view article-content"] video[style]');
    const hidden = [];
    for (const i of media) {
        const width = parseFloat(getComputedStyle(i).width);
        const height = parseFloat(getComputedStyle(i).height);
        if (width <= 10 || height <= 10) {
            i.style = '';
            i.parentNode.style.display = 'none';
            hidden.push(i.parentNode);
        }
    }

    if (hidden.length !== 0) {
        const expandButton = document.createElement('button');
        expandButton.style.cssText = `
            padding: .3rem .3rem;
            margin-bottom: 1rem;
            border: 1px solid;
            border-radius: 3px;
            border-color: var(--color-bd-outer);
            background-color: var(--color-bg-main);
            color: var(--color-text-color);
            text-align: center;
            font-family: inherit;
            font-size: 85%;
            line-height: inherit;
            `;
        expandButton.innerText = '숨겨진 이미지 열기';
        document.querySelector('div[class="fr-view article-content"]').prepend(expandButton);
        $(expandButton).click(function() {
            for (const i of hidden) {
                $(i).slideToggle();
            }
            expandButton.innerText = expandButton.innerText === '숨겨진 이미지 열기' ? '숨겨진 이미지 닫기' : '숨겨진 이미지 열기';
        });
    }
}
expandImage();



// 추천/비추천에 대한 확인창 추가
function rateWarning() {
    const buttons = document.querySelectorAll('div[id="vote"] button');
    for (const i of buttons) {
        i.addEventListener('click', function(event) {
            const dialog = i.id === 'rateUp' ? '추천하시겠습니까?' : '비추하시겠습니까?';
            const confirmRate = confirm(dialog);
            if (!confirmRate) {
                event.preventDefault();
                event.stopPropagation();
            }
        });
    }
}
rateWarning();



// 게시글 작성에 대한 확인창 추가
function postWarning() {
    const submitButton = document.querySelector('div[class="btns"] button[id="submitBtn"]');
    if (submitButton !== null) {
        const currentChannel = document.querySelector('div[class="board-title"] a[class="title"] span').getAttribute('title');
        function confirmSubmitPost(event) {
            const categoryList = document.querySelector('select[class="arca-select category-select"]')
            const categoryValue = categoryList.value;
            const categoryName = categoryList.querySelector(`option[value="${categoryValue}"]`).innerText;
            let dialog;
            if (myUsername !== null) {
                dialog = `계정:    ${myUsername}\n채널:    ${currentChannel}\n글머리: ${categoryName}\n\n게시하시겠습니까?`;
            } else {
                dialog = `계정:    (유동)\n채널:    ${currentChannel}\n글머리: ${categoryName}\n\n게시하시겠습니까?`;
            }
            const confirmPost = confirm(dialog);
            if (confirmPost) {
                if (categoryName.includes('공지')) {
                    const confirmNotice = confirm(`현재 선택된 글머리는 '${categoryName}'입니다.\n정말로 게시하시겠습니까?`);
                    if (confirmNotice) {
                        submitButton.click();
                    } else {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                } else {
                    submitButton.click();
                }
            } else {
                event.preventDefault();
                event.stopPropagation();
            }
        }

        const submitButton_clone = submitButton.cloneNode(true);
        submitButton.style.display = 'none';
        submitButton.parentNode.append(submitButton_clone);

        submitButton_clone.addEventListener('click', function(event) {
            confirmSubmitPost(event);
        });

        const title = document.querySelector('input[id="inputTitle"]');
        title.addEventListener('keydown', function(event) {
            if (event.code === 'Enter' || event.code === 'NumpadEnter') {
                confirmSubmitPost(event);
            }
        });
    }
}
postWarning();



// 댓글 작성에 대한 확인창 추가
function commentWarning() {
    const commentSection = document.getElementById('comment');
    if (commentSection !== null) {
        const currentChannel = document.querySelector('div[class="board-title"] a[class="title"] span').getAttribute('title');
        function confirmSubmitComment(event) {
            let dialog;
            if (myUsername !== null) {
                dialog = `계정:    ${myUsername}\n채널:    ${currentChannel}\n\n게시하시겠습니까?`;
            } else {
                dialog = `계정:    (유동)\n채널:    ${currentChannel}\n\n게시하시겠습니까?`;
            }
            const confirmPost = confirm(dialog);
            if (!confirmPost) {
                event.preventDefault();
                event.stopPropagation();
            }
        }

        let commentButtons = document.querySelectorAll('div[class="reply-form__submit-button-wrapper"] button');
        let emoticons;

        for (const i of commentButtons) {
            i.parentNode.style.display = 'unset';
            if (!i.getAttribute('has-listener')) {
                i.addEventListener("click", function(event) {
                    confirmSubmitComment(event);
                });
                i.setAttribute('has-listener', true);
            }
        }

        const observer = new MutationObserver(function() {
            commentButtons = document.querySelectorAll('div[class="reply-form__submit-button-wrapper"] button');
            for (const i of commentButtons) {
                i.parentNode.style.display = 'unset';
                if (!i.getAttribute('has-listener')) {
                    i.addEventListener("click", function(event) {
                        confirmSubmitComment(event)
                    });
                    i.setAttribute('has-listener', true);
                }
            }

            emoticons = document.querySelector('div[class="emoticons"]');
            if (emoticons !== null) {
                if (!emoticons.getAttribute('has-listener')) {
                    emoticons.addEventListener("click", function(event) {
                        if (event.target.tagName.toLowerCase() === 'img') {
                            confirmSubmitComment(event);
                        }
                    });
                    emoticons.setAttribute('has-listener', true);
                }
            }
        });
        observer.observe(commentSection, { childList: true, subtree: true });
    }
}
commentWarning();



// 댓글 링크에 낚시 방지용 표시 추가
function antiFish() {
    const commentLink = document.querySelectorAll('div[class="comment-item"] div[class="text"] a[href], div[class="comment-item fadein"] div[class="text"] a[href]');
    let currentUrl;
    if (document.querySelector('div[class="article-link"] a[href]') !== null) {
        currentUrl = document.querySelector('div[class="article-link"] a[href]').getAttribute('href');
    }
    for (const i of commentLink) {
        if (i.getAttribute('href').includes(currentUrl)) {
            i.style.textDecoration = 'line-through';
            i.style.color = 'var(--color-visited-article)';

            const icon = document.createElement('span');
            icon.setAttribute('class', 'ion-loop');
            icon.style.margin = '0 .25rem';
            i.parentNode.insertBefore(icon, i);
        }
    }
}
antiFish();



// 설정 메뉴
GM_addStyle(`
    #settings-menu-wrapper {
        display: none;
    }
    #settings-menu-backdrop {
        display: inherit;
        position: fixed;
        z-index: 9998;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: #000;
        opacity: .5;
    }
    #settings-menu {
        display: inherit;
        position: fixed;
        z-index: 9999;
        overflow-y: auto;
        padding: 20px;
        border: 1px solid;
        border-radius: 5px;
        border-color: var(--color-bd-outer);
        background-color: var(--color-bg-main);
        color: var(--color-text-color);
        }
    @media (min-width: 601px) {
        #settings-menu {
            left: 20vw;
            top: 10vh;
            width: 60vw;
            height: 80vh;
        }
    }
    @media (max-width: 600px) {
        #settings-menu {
            left: 5vw;
            top: 5vh;
            width: 90vw;
            height: 90vh;
        }
    }
    #settings-menu-close {
         float: right;
         color: var(--color-text-color);
         background-color: transparent;
         border: none;
    }
    #tools-header,
    #blacklist-user-header,
    #blacklist-category-header,
    #blacklist-keyword-header,
    #blacklist-batch-header {
        cursor: pointer;
    }
    #tools-container,
    #blacklist-user-table-container,
    #blacklist-category-table-container,
    #blacklist-keyword-table-container,
    #blacklist-batch-table-container {
        display: none;
        max-height: 20rem;
        overflow-y: auto;
        border: 1px solid;
        border-radius: 5px;
        border-color: var(--color-bd-outer);
    }
    #anonify-table,
    #base64-table,
    #blacklist-user-table,
    #blacklist-category-table,
    #blacklist-keyword-table,
    #blacklist-batch-table {
        border-collapse: separate;
        border-spacing: .5rem;
        table-layout: fixed;
    }
    #anonify-table tr td label {
        margin-bottom: 0;
    }
    #base64-table {
        width: 100%;
    }
    #base64-input-textfield, #base64-output-textarea {
        width: 100%;
        border: 1px solid;
        border-radius: 5px;
        border-color: var(--color-bd-outer);
    }
    #base64-encode-button, #base64-decode-button, #base64-copy-button {
        border: 1px solid;
        border-radius: 3px;
        border-color: var(--color-bd-outer);
        background-color: var(--color-bg-main);
        color: var(--color-text-color);
    }
    #blacklist-user-table thead th, #blacklist-user-table tfoot td,
    #blacklist-category-table thead th, #blacklist-category-table tfoot td,
    #blacklist-keyword-table thead th, #blacklist-keyword-table tfoot td,
    #blacklist-batch-table thead th, #blacklist-batch-table tfoot td {
        position: sticky;
        top: 0;
        white-space: nowrap;
        background-color: var(--color-bg-main);
    }
    #blacklist-user-row td,
    #blacklist-category-row td,
    #blacklist-keyword-row td,
    #blacklist-batch-row td {
        vertical-align: top;
    }
    #blacklist-user-row td:nth-child(1),
    #blacklist-category-row td:nth-child(1),
    #blacklist-keyword-row td:nth-child(1) {
        max-width: 10rem;
        word-wrap: break-word;
    }
    #blacklist-user-row td:nth-child(2),
    #blacklist-category-row td:nth-child(2),
    #blacklist-keyword-row td:nth-child(2) {
        max-width: 15rem;
        word-wrap: break-word;
    }
    #blacklist-user-row td:nth-child(4) {
        white-space: nowrap;
    }
    #blacklist-user-add, #blacklist-user-delete, #blacklist-user-edit,
    #blacklist-category-add, #blacklist-category-delete,  #blacklist-category-edit,
    #blacklist-keyword-add, #blacklist-keyword-delete,  #blacklist-keyword-edit {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.5rem;
        height: 1.5rem;
        border: 1px solid;
        border-radius: 3px;
        border-color: var(--color-bd-outer);
        background-color: var(--color-bg-main);
        color: var(--color-text-color);
    }
    #blacklist-user-textfield,
    #blacklist-category-textfield,
    #blacklist-keyword-textfield {
        width: 10rem;
    }
    #blacklist-memo-textfield,
    #blacklist-category-slug-textfield,
    #blacklist-keyword-slug-textfield {
        width: 15rem;
    }
    #blacklist-user-textfield, #blacklist-memo-textfield,
    #blacklist-category-textfield, #blacklist-category-slug-textfield,
    #blacklist-keyword-textfield, #blacklist-keyword-slug-textfield {
        border: 1px solid;
        border-radius: 5px;
        border-color: var(--color-bd-outer);
    }
    #blacklist-user-batch-textarea, #blacklist-category-batch-textarea, #blacklist-keyword-batch-textarea {
        width: 14.4rem;
        border: 1px solid;
        border-radius: 5px;
        border-color: var(--color-bd-outer);
    }
    #blacklist-user-batch-edit, #blacklist-category-batch-edit, #blacklist-keyword-batch-edit {
        width: 14.4rem;
        border: 1px solid;
        border-radius: 3px;
        border-color: var(--color-bd-outer);
        background-color: var(--color-bg-main);
        color: var(--color-text-color);
    }
    .toggle-switch {
        position: relative;
        display: inline-block;
        width: 54px;
        height: 30px;
        margin: 0 10px;
    }
    .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }
    .toggle-switch .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        border-radius: 30px;
        transition: .4s;
    }
    .toggle-switch .slider:before {
        position: absolute;
        content: '';
        height: 22px;
        width: 22px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        border-radius: 50%;
        transition: .4s;
    }
    input:checked + .slider {
        background-color: #0070f3;
    }
    input:checked + .slider:before {
        transform: translateX(24px);
    }
`);

$(document.querySelector('ul[class="nav-control"]')).append(`
    <li id="settings-button">
        <span class="ion-wrench"></span>
    </li>
`);
$('#settings-button').click(function() {
    document.querySelector('div[id="settings-menu-wrapper"]').style.display = 'unset';
});

$(document.querySelector('ul[class="nav-control"] a[id="goListBtn"]')).parent().replaceWith(`
    <li id="scroll-button">
        <span class="ion-edit"></span>
    </li>
`);
$('#scroll-button').click(function() {
    document.querySelector('div[id="comment"]').scrollIntoView({ block: 'end' });
});

$('body').append(`
    <div id="settings-menu-wrapper">
        <div id="settings-menu">
            <div style="display: flex; justify-content: space-between;">
                <h3 style="margin-bottom: 0">설정</h3>
                <button id="settings-menu-close" class="ion-close" style="font-size: 1.5rem"></button>
            </div>
            <br>
            <h4 id="tools-header">도구<span class="ion-chevron-down" style="margin-left: .5rem;"></span></h4>
            <div id="tools-container">
                <h5 style="margin-top: .5rem; margin-left: .5rem;">익명화</h5>
                <table id="anonify-table">
                    <tr>
                        <td><label>닉네임 익명화</label></td>
                        <td><label class="toggle-switch" id="anonify-toggle">
                            <span class="slider"></span>
                        </label></td>
                    </tr>
                    <tr>
                        <td><label>내 닉네임도 포함</label></td>
                        <td><label class="toggle-switch" id="include-self-toggle"><span class="slider"></span>
                        </label></td>
                    </tr>
                </table>
                <h5 style="margin-top: 1rem; margin-left: .5rem;">Base64 인코더/디코더</h5>
                <table id="base64-table">
                    <tr>
                        <td><input type="text" id="base64-input-textfield" placeholder="인코드 또는 디코드할 문자열"></td>
                    </tr>
                    <tr>
                        <td><button id="base64-encode-button" style="margin-right: .5rem">인코드</button><button id="base64-decode-button">디코드</button></td>
                    </tr>
                    <tr>
                        <td><textarea id="base64-output-textarea" style="margin-top: .5rem" disabled></textarea></td>
                    </tr>
                    <tr>
                        <td><button id="base64-copy-button">복사</button></td>
                    </tr>
                </table>
            </div>
            <br>
            <h4 id="blacklist-user-header">유저 메모/뮤트<span class="ion-chevron-down" style="margin-left: .5rem;"></span></h4>
            <div id="blacklist-user-table-container">
                <table id="blacklist-user-table">
                    <thead>
                        <tr>
                            <th>닉네임</th>
                            <th>메모</th>
                            <th>표시</th>
                            <th>타임스탬프</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                    <tfoot>
                        <tr id="user-text-field">
                            <td><input type="text" id="blacklist-user-textfield" placeholder="닉네임"></input></td>
                            <td><input type="text" id="blacklist-memo-textfield" placeholder="메모"></input></td>
                            <td style="text-align: center"><input type="checkbox" id="blacklist-user-checkbox"></input></td>
                            <td></td>
                            <td style="text-align: center"><button class="ion-android-add-circle" id="blacklist-user-add"></button></td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <br>
            <h4 id="blacklist-category-header">탭 뮤트<span class="ion-chevron-down" style="margin-left: .5rem;"></span></h4>
            <div id="blacklist-category-table-container">
                <table id="blacklist-category-table">
                    <thead>
                        <tr>
                            <th>탭</th>
                            <th>채널 슬러그</th>
                            <th>표시</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                    <tfoot>
                        <tr id="category-text-field">
                            <td><input type="text" id="blacklist-category-textfield" placeholder="탭"></input></td>
                            <td><input type="text" id="blacklist-category-slug-textfield" placeholder="채널 슬러그" autocapitalize = "none"></input></td>
                            <td style="text-align: center"><input type="checkbox" id="blacklist-category-checkbox"></input></td>
                            <td style="text-align: center"><button class="ion-android-add-circle" id="blacklist-category-add"></button></td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <br>
            <h4 id="blacklist-keyword-header">키워드 뮤트<span class="ion-chevron-down" style="margin-left: .5rem"></span></h4>
            <div id="blacklist-keyword-table-container">
                <table id="blacklist-keyword-table">
                    <thead>
                        <tr>
                            <th>키워드(RegEx)</th>
                            <th>채널 슬러그</th>
                            <th>표시</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                    <tfoot>
                        <tr id="keyword-text-field">
                            <td><input type="text" id="blacklist-keyword-textfield" placeholder="키워드(RegEx)"></input></td>
                            <td><input type="text" id="blacklist-keyword-slug-textfield" placeholder="채널 슬러그" autocapitalize = "none"></input></td>
                            <td style="text-align: center"><input type="checkbox" id="blacklist-keyword-checkbox"></input></td>
                            <td style="text-align: center"><button class="ion-android-add-circle" id="blacklist-keyword-add"></button></td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <br>
            <h4 id="blacklist-batch-header">블랙리스트 일괄 수정<span class="ion-chevron-down" style="margin-left: .5rem;"></span></h4>
            <div id="blacklist-batch-table-container">
                <table id="blacklist-batch-table">
                    <thead>
                        <tr>
                            <th>유저</th>
                            <th>탭</th>
                            <th>키워드</th>
                        </tr>
                    </thead>
                    <tbody id="blacklist-batch-row">
                        <td><textarea id="blacklist-user-batch-textarea" rows="8" wrap="off"></textarea></td>
                        <td><textarea id="blacklist-category-batch-textarea" rows="8" wrap="off"></textarea></td>
                        <td><textarea id="blacklist-keyword-batch-textarea" rows="8" wrap="off"></textarea></td>
                    </tbody>
                    <tfoot>
                        <td><button id="blacklist-user-batch-edit">유저 블랙리스트 일괄 수정</button></td>
                        <td><button id="blacklist-category-batch-edit">탭 블랙리스트 일괄 수정</button></td>
                        <td><button id="blacklist-keyword-batch-edit">키워드 블랙리스트 일괄 수정</button></td>
                    </tfood>
                </table>
            </div>
        </div>
        <div id="settings-menu-backdrop">
        </div>
    </div>
`);

$('#settings-menu-backdrop').click(function() {
    document.querySelector('div[id="settings-menu-wrapper"]').style.display = 'none';
});

$('#settings-menu-close').click(function() {
    document.querySelector('div[id="settings-menu-wrapper"]').style.display = 'none';
});


function menuEventHandler() {
    $('#tools-header').click(function() {
        $('#tools-container').slideToggle();
        if (document.querySelector('h4[id="tools-header"] span').getAttribute('class') === 'ion-chevron-up') {
            document.querySelector('h4[id="tools-header"] span').setAttribute('class', 'ion-chevron-down');
        } else {
            document.querySelector('h4[id="tools-header"] span').setAttribute('class', 'ion-chevron-up');
        }
    });

    $('#blacklist-user-header').click(function() {
        $('#blacklist-user-table-container').slideToggle();
        if (document.querySelector('h4[id="blacklist-user-header"] span').getAttribute('class') === 'ion-chevron-up') {
            document.querySelector('h4[id="blacklist-user-header"] span').setAttribute('class', 'ion-chevron-down');
        } else {
            document.querySelector('h4[id="blacklist-user-header"] span').setAttribute('class', 'ion-chevron-up');
        }
    });

    $('#blacklist-user-textfield, #blacklist-memo-textfield').on('keypress', function(event) {
        if (event.keyCode === 13) {
            $('#blacklist-user-add').click();
        }
    });

    $('#blacklist-category-header').click(function() {
        $('#blacklist-category-table-container').slideToggle();
        if (document.querySelector('h4[id="blacklist-category-header"] span').getAttribute('class') === 'ion-chevron-up') {
            document.querySelector('h4[id="blacklist-category-header"] span').setAttribute('class', 'ion-chevron-down');
        } else {
            document.querySelector('h4[id="blacklist-category-header"] span').setAttribute('class', 'ion-chevron-up');
        }
    });

    $('#blacklist-category-textfield, #blacklist-category-slug-textfield').on('keypress', function(event) {
        if (event.keyCode === 13) {
            $('#blacklist-category-add').click();
        }
    });

    $('#blacklist-keyword-header').click(function() {
        $('#blacklist-keyword-table-container').slideToggle();
        if (document.querySelector('h4[id="blacklist-keyword-header"] span').getAttribute('class') === 'ion-chevron-up') {
            document.querySelector('h4[id="blacklist-keyword-header"] span').setAttribute('class', 'ion-chevron-down');
        } else {
            document.querySelector('h4[id="blacklist-keyword-header"] span').setAttribute('class', 'ion-chevron-up');
        }
    });

    $('#blacklist-keyword-textfield, #blacklist-keyword-slug-textfield').on('keypress', function(event) {
        if (event.keyCode === 13) {
            $('#blacklist-keyword-add').click();
        }
    });

    $('#blacklist-batch-header').click(function() {
        $('#blacklist-batch-table-container').slideToggle();
        if (document.querySelector('h4[id="blacklist-batch-header"] span').getAttribute('class') === 'ion-chevron-up') {
            document.querySelector('h4[id="blacklist-batch-header"] span').setAttribute('class', 'ion-chevron-down');
        } else {
            document.querySelector('h4[id="blacklist-batch-header"] span').setAttribute('class', 'ion-chevron-up');
        }
    });
}
menuEventHandler();



// 닉네임 익명화
const anonifyToggle = document.createElement('input');
anonifyToggle.type = 'checkbox';
anonifyToggle.addEventListener('change', anonify);
$('#anonify-toggle').prepend(anonifyToggle);

const anonifySelfToggle = document.createElement('input');
anonifySelfToggle.type = 'checkbox';
anonifySelfToggle.addEventListener('change', anonify);
$('#include-self-toggle').prepend(anonifySelfToggle);

function anonify() {
    function undoHighlightMe() {
        for (const i of postAuthors) {
            if (i.innerText === myUsername) {
                i.style.fontWeight = 'unset';
                i.style.backgroundColor = 'unset';
            }
        }
        for (const i of commentAuthors) {
            if (i.innerText === myUsername) {
                i.closest('div[class="info-row clearfix"]').style.fontWeight = 'unset';
                i.closest('div[class="info-row clearfix"]').style.backgroundColor = 'var(--color-bg-focus)';
            }
        }
    }
    if (anonifyToggle.checked) {
        undoHighlightMe();
    } else {
        highlightMe();
    }

    const anon = document.createElement('span');
    anon.setAttribute('id', 'anon-info');

    const anonRefresh = document.querySelectorAll('span[id="anon-info"]');
    for (const i of anonRefresh) {
        i.remove();
    }

    // 글 목록 익명화
    const postAnonList = [];
    for (const i of postAuthors) {
        if (anonifySelfToggle.checked || i.getAttribute('data-filter') !== myUsername) {
            if (!postAnonList.includes(i.getAttribute('data-filter'))) {
                postAnonList.push(i.getAttribute('data-filter'));
            }
        }
    }

    for (const i of postAuthors) {
        const thisColumn = i.closest('span[class="vcol col-author"]');
        if (postAnonList.includes(i.getAttribute('data-filter'))) {
            const anon_clone = anon.cloneNode(true);
            const anonIndex = postAnonList.indexOf(i.getAttribute('data-filter')) + 1
            anon_clone.innerText = '(익명 #' + anonIndex + ')';
            thisColumn.append(anon_clone);
        }

        if (anonifyToggle.checked) {
            if (anonifySelfToggle.checked || i.getAttribute('data-filter') !== myUsername) {
                i.parentNode.style.display = 'none';
                if (thisColumn.querySelector('span[id="anon-info"]') !== null) {
                    thisColumn.querySelector('span[id="anon-info"]').style.display = '';
                }
            } else {
                i.parentNode.style.display = '';
                if (thisColumn.querySelector('span[id="anon-info"]') !== null) {
                    thisColumn.querySelector('span[id="anon-info"]').style.display = 'none';
                }
            }
        } else {
            i.parentNode.style.display = '';
            if (thisColumn.querySelector('span[id="anon-info"]') !== null) {
                thisColumn.querySelector('span[id="anon-info"]').style.display = 'none';
            }
        }
    }


    if (document.querySelector('div[class="member-info"]') !== null) {
        // 글 작성자 익명화
        const commentAnonList = [];
        const thisPostMemberInfo = document.querySelector('div[class="member-info"]');
        const thisPostUsername = thisPostMemberInfo.querySelector('span[class="user-info"] a[data-filter]').getAttribute('data-filter');
        if (anonifySelfToggle.checked || thisPostUsername !== myUsername) {
            commentAnonList.push(thisPostUsername);
        }

        if (commentAnonList.includes(thisPostUsername)) {
            const anon_clone = anon.cloneNode(true);
            const anonIndex = commentAnonList.indexOf(thisPostUsername) + 1
            anon_clone.innerText = '(익명 #' + anonIndex + ')';
            thisPostMemberInfo.parentNode.insertBefore(anon_clone, thisPostMemberInfo.parentNode.firstChild);
        }

        if (anonifyToggle.checked) {
            if (anonifySelfToggle.checked || thisPostUsername !== myUsername) {
                thisPostMemberInfo.style.display = 'none';
                if (thisPostMemberInfo.parentNode.querySelector('span[id="anon-info"]') !== null) {
                    thisPostMemberInfo.parentNode.querySelector('span[id="anon-info"]').style.display = '';
                }
            } else {
                thisPostMemberInfo.style.display = '';
                if (thisPostMemberInfo.parentNode.querySelector('span[id="anon-info"]') !== null) {
                    thisPostMemberInfo.parentNode.querySelector('span[id="anon-info"]').style.display = 'none';
                }
            }
        } else {
            thisPostMemberInfo.style.display = '';
            if (thisPostMemberInfo.parentNode.querySelector('span[id="anon-info"]') !== null) {
                thisPostMemberInfo.parentNode.querySelector('span[id="anon-info"]').style.display = 'none';
            }
        }


        // 댓글 목록 익명화
        for (const i of commentAuthors) {
            if (anonifySelfToggle.checked || i.getAttribute('data-filter') !== myUsername) {
                if (!commentAnonList.includes(i.getAttribute('data-filter'))) {
                    commentAnonList.push(i.getAttribute('data-filter'));
                }
            }
        }
        for (const i of commentAuthors) {
            const thisComment = i.closest('div[class="info-row clearfix"]');
            if (commentAnonList.includes(i.getAttribute('data-filter'))) {
                const anon_clone = anon.cloneNode(true);
                const anonIndex = commentAnonList.indexOf(i.getAttribute('data-filter')) + 1
                anon_clone.innerText = '(익명 #' + anonIndex + ')';
                if (i.getAttribute('data-filter') === thisPostUsername) {
                    anon_clone.classList.add('author');
                }
                thisComment.append(anon_clone);
            }
            if (anonifyToggle.checked) {
                if (anonifySelfToggle.checked || i.getAttribute('data-filter') !== myUsername) {
                    thisComment.querySelector('span[class="user-info"], span[class="user-info author"]').style.display = 'none';
                    thisComment.querySelector('div[class="avatar"]').style.display = 'none';
                    if (thisComment.querySelector('span[id="anon-info"]') !== null) {
                        thisComment.querySelector('span[id="anon-info"]').style.display = '';
                    }
                } else {
                    thisComment.querySelector('span[class="user-info"], span[class="user-info author"]').style.display = '';
                    thisComment.querySelector('div[class="avatar"]').style.display = '';
                    if (thisComment.querySelector('span[id="anon-info"]') !== null) {
                        thisComment.querySelector('span[id="anon-info"]').style.display = 'none';
                    }
                }
            } else {
                thisComment.querySelector('span[class="user-info"], span[class="user-info author"]').style.display = '';
                thisComment.querySelector('div[class="avatar"]').style.display = '';
                if (thisComment.querySelector('span[id="anon-info"]') !== null) {
                    thisComment.querySelector('span[id="anon-info"]').style.display = 'none';
                }
            }
        }
    }
}



// Base64 인코딩/디코딩
function base64Converter() {
    $('#base64-encode-button').click(function() {
        const inputText = $('#base64-input-textfield').val();
        if (inputText !== '') {
            try {
                const bytes = new TextEncoder().encode(inputText);
                const binString = String.fromCodePoint(...bytes);
                $('#base64-output-textarea').val(btoa(binString));
            } catch (error) {
                if (error instanceof DOMException) {
                    alert('인코드할 문자열에 유효하지 않은 문자가 있습니다. 문자열을 다시 확인해주세요.');
                } else {
                    alert('알 수 없는 오류가 발생했습니다.');
                }
            }
        } else {
            alert('인코드할 문자열을 입력해주세요.');
        }
    });

    $('#base64-decode-button').click(function() {
        const inputText = $('#base64-input-textfield').val();
        if (inputText !== '') {
            try {
                const binString = atob(inputText);
                const utf8 = Uint8Array.from(binString, (m) => m.codePointAt(0));
                $('#base64-output-textarea').val(new TextDecoder().decode(utf8));
            } catch (error) {
                if (error instanceof DOMException) {
                    alert('디코드할 문자열에 유효하지 않은 문자가 있습니다. 문자열을 다시 확인해주세요.');
                } else {
                    alert('알 수 없는 오류가 발생했습니다.');
                }
            }
        } else {
            alert('디코드할 문자열을 입력해주세요.');
        }
    });

    $('#base64-copy-button').click(function() {
        const outputText = $('#base64-output-textarea').val();
        navigator.clipboard.writeText(outputText);
    });
}
base64Converter();



function sortTime(a, b) {
    const timeA = new Date(a[3]);
    const timeB = new Date(b[3]);
    return timeA - timeB;
}

function blacklistUserMenu() {
    renderBlacklistUserMenu();
    $('#blacklist-user-add').click(function() {
        const blacklistUser = GM_getValue('blacklistUser', []);
        if ($('#blacklist-user-textfield').val() === '') {
            alert('차단 또는 메모할 유저의 닉네임을 입력해주세요.');
        } else if (blacklistUser.map(i => i[0]).includes($('#blacklist-user-textfield').val())) {
            const confirmAction = confirm('이미 블랙리스트에 있는 유저입니다. 수정하시겠습니까?');
            if (confirmAction) {
                const data = [$('#blacklist-user-textfield').val(), $('#blacklist-memo-textfield').val(), $('#blacklist-user-checkbox').prop('checked'), Date.now()];
                $('#blacklist-user-textfield').val('');
                $('#blacklist-memo-textfield').val('');
                $('#blacklist-user-checkbox').prop('checked', false);
                blacklistUser[blacklistUser.map(i => i[0]).indexOf(data[0])] = data;
                blacklistUser.sort(sortTime);
                GM_setValue('blacklistUser', blacklistUser);
                renderBlacklistUserMenu();
            }
        } else {
            const data = [$('#blacklist-user-textfield').val(), $('#blacklist-memo-textfield').val(), $('#blacklist-user-checkbox').prop('checked'), Date.now()];
            $('#blacklist-user-textfield').val('');
            $('#blacklist-memo-textfield').val('');
            $('#blacklist-user-checkbox').prop('checked', false);
            blacklistUser.push(data);
            blacklistUser.sort(sortTime);
            GM_setValue('blacklistUser', blacklistUser);
            renderBlacklistUserMenu();
        }
    });
}
blacklistUserMenu();

function convertTime(time) {
    const now = new Date(time);
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const date = now.getDate().toString().padStart(2, '0');
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    const second = now.getSeconds().toString().padStart(2, '0');
    return year + '-' + month + '-' + date + ' ' + hour + ':' + minute + ':' + second
}

function renderBlacklistUserMenu() {
    const blacklistUser = GM_getValue('blacklistUser', []);
    for (const i of document.querySelectorAll('#blacklist-user-table tbody tr')) {
        i.remove();
    }
    for (let i = 0; i < blacklistUser.length; i++) {
        $('#blacklist-user-table tbody').append('<tr id="blacklist-user-row"></tr>');
        $('#blacklist-user-table tbody tr:eq(-1)').append('<td><a href="' + 'https://arca.live/u/@' + blacklistUser[i][0].replace('#', '/') + '">' + blacklistUser[i][0] + '</a></td>');
        $('#blacklist-user-table tbody tr:eq(-1)').append('<td>' + blacklistUser[i][1] + '</td>');
        const banned = Boolean(blacklistUser[i][2]);
        if (banned) {
            $('#blacklist-user-table tbody tr:eq(-1)').append('<td class="ion-eye-disabled" style="text-align: center; color: #dc3545;"></td>');
        } else {
            $('#blacklist-user-table tbody tr:eq(-1)').append('<td class="ion-eye" style="text-align: center; color: #28a745;"></td>');
        }
        $('#blacklist-user-table tbody tr:eq(-1)').append('<td>' + convertTime(blacklistUser[i][3]) + '</td>');
        $('#blacklist-user-table tbody tr:eq(-1)').append('<td style="text-align: center"><button class="ion-trash-b" id="blacklist-user-delete"></button></td>');
        $('#blacklist-user-table tbody tr:eq(-1)').append('<td style="text-align: center"><button class="ion-edit" id="blacklist-user-edit"></button></td>');
    }
    const deleteButton = document.querySelectorAll('button[id="blacklist-user-delete"]');
    const editButton = document.querySelectorAll('button[id="blacklist-user-edit"]');
    for (let i = 0; i < blacklistUser.length; i++) {
        deleteButton[i].addEventListener('click', function() {
            const confirmAction = confirm('해당 유저를 블랙리스트에서 삭제합니다.');
            if (confirmAction) {
                blacklistUser.splice(i, 1);
                blacklistUser.sort(sortTime);
                GM_setValue('blacklistUser', blacklistUser);
                renderBlacklistUserMenu();
            }
        });
        editButton[i].addEventListener('click', function() {
            $('#blacklist-user-textfield').val(blacklistUser[i][0]);
            $('#blacklist-memo-textfield').val(blacklistUser[i][1]);
            $('#blacklist-user-checkbox').prop('checked', blacklistUser[i][2]);
        });
    }
    $('#blacklist-user-batch-textarea').val(JSON.stringify(blacklistUser, null, 4));
}

function blacklistCategoryMenu() {
    renderBlacklistCategoryMenu();
    $('#blacklist-category-add').click(function() {
        const blacklistCategory = GM_getValue('blacklistCategory', []);
        if ($('#blacklist-category-textfield').val() === '') {
            alert('차단할 탭을 입력해주세요.');
        } else if (blacklistCategory.map(i => i[0]).includes($('#blacklist-category-textfield').val())) {
            const confirmAction = confirm('이미 블랙리스트에 있는 탭입니다. 수정하시겠습니까?');
            if (confirmAction) {
                const data = [$('#blacklist-category-textfield').val(), $('#blacklist-category-slug-textfield').val(), $('#blacklist-category-checkbox').prop('checked')];
                $('#blacklist-category-textfield').val('');
                $('#blacklist-category-slug-textfield').val('');
                $('#blacklist-category-checkbox').prop('checked', false);
                blacklistCategory[blacklistCategory.map(i => i[0]).indexOf(data[0])] = data;
                GM_setValue('blacklistCategory', blacklistCategory);
                renderBlacklistCategoryMenu();
            }
        } else {
            const data = [$('#blacklist-category-textfield').val(), $('#blacklist-category-slug-textfield').val(), $('#blacklist-category-checkbox').prop('checked')];
            $('#blacklist-category-textfield').val('');
            $('#blacklist-category-slug-textfield').val('');
            $('#blacklist-category-checkbox').prop('checked', false);
            blacklistCategory.push(data);
            GM_setValue('blacklistCategory', blacklistCategory);
            renderBlacklistCategoryMenu();
        }
    });
}
blacklistCategoryMenu();

function renderBlacklistCategoryMenu() {
    const blacklistCategory = GM_getValue('blacklistCategory', []);
    for (const i of document.querySelectorAll('#blacklist-category-table tbody tr')) {
        i.remove();
    }
    for (let i = 0; i < blacklistCategory.length; i++) {
        $('#blacklist-category-table tbody').append('<tr id="blacklist-category-row"></tr>');
        $('#blacklist-category-table tbody tr:eq(-1)').append('<td>' + blacklistCategory[i][0] + '</td>');
        $('#blacklist-category-table tbody tr:eq(-1)').append('<td>' + blacklistCategory[i][1] + '</td>');
        const banned = Boolean(blacklistCategory[i][2]);
        if (banned) {
            $('#blacklist-category-table tbody tr:eq(-1)').append('<td class="ion-eye-disabled" style="text-align: center; color: #dc3545;"></td>');
        } else {
            $('#blacklist-category-table tbody tr:eq(-1)').append('<td class="ion-eye" style="text-align: center; color: #28a745;"></td>');
        }
        $('#blacklist-category-table tbody tr:eq(-1)').append('<td style="text-align: center"><button class="ion-trash-b" id="blacklist-category-delete"></button></td>');
        $('#blacklist-category-table tbody tr:eq(-1)').append('<td style="text-align: center"><button class="ion-edit" id="blacklist-category-edit"></button></td>');
    }
    const deleteButton = document.querySelectorAll('button[id="blacklist-category-delete"]');
    const editButton = document.querySelectorAll('button[id="blacklist-category-edit"]');
    for (let i = 0; i < blacklistCategory.length; i++) {
        deleteButton[i].addEventListener('click', function() {
            const confirmAction = confirm('해당 탭을 블랙리스트에서 삭제합니다.');
            if (confirmAction) {
                blacklistCategory.splice(i, 1);
                GM_setValue('blacklistCategory', blacklistCategory);
                renderBlacklistCategoryMenu();
            }
        });
        editButton[i].addEventListener('click', function() {
            $('#blacklist-category-textfield').val(blacklistCategory[i][0]);
            $('#blacklist-category-slug-textfield').val(blacklistCategory[i][1]);
            $('#blacklist-category-checkbox').prop('checked', blacklistCategory[i][2]);
        });
    }
    $('#blacklist-category-batch-textarea').val(JSON.stringify(blacklistCategory, null, 4));
}

function blacklistKeywordMenu() {
    renderBlacklistKeywordMenu();
    $('#blacklist-keyword-add').click(function() {
        const blacklistKeyword = GM_getValue('blacklistKeyword', []);
        if ($('#blacklist-keyword-textfield').val() === '') {
            alert('차단할 키워드를 입력해주세요.');
        } else if (blacklistKeyword.map(i => i[0]).includes($('#blacklist-keyword-textfield').val())) {
            const confirmAction = confirm('이미 블랙리스트에 있는 키워드입니다. 수정하시겠습니까?');
            if (confirmAction) {
                const data = [$('#blacklist-keyword-textfield').val(), $('#blacklist-keyword-slug-textfield').val(), $('#blacklist-keyword-checkbox').prop('checked')];
                $('#blacklist-keyword-textfield').val('');
                $('#blacklist-keyword-slug-textfield').val('');
                $('#blacklist-keyword-checkbox').prop('checked', false);
                blacklistKeyword[blacklistKeyword.map(i => i[0]).indexOf(data[0])] = data;
                GM_setValue('blacklistKeyword', blacklistKeyword);
                renderBlacklistKeywordMenu();
            }
        } else {
            const data = [$('#blacklist-keyword-textfield').val(), $('#blacklist-keyword-slug-textfield').val(), $('#blacklist-keyword-checkbox').prop('checked')];
            $('#blacklist-keyword-textfield').val('');
            $('#blacklist-keyword-slug-textfield').val('');
            $('#blacklist-keyword-checkbox').prop('checked', false);
            blacklistKeyword.push(data);
            GM_setValue('blacklistKeyword', blacklistKeyword);
            renderBlacklistKeywordMenu();
        }
    });
}
blacklistKeywordMenu();

function renderBlacklistKeywordMenu() {
    const blacklistKeyword = GM_getValue('blacklistKeyword', []);
    for (const i of document.querySelectorAll('#blacklist-keyword-table tbody tr')) {
        i.remove();
    }
    for (let i = 0; i < blacklistKeyword.length; i++) {
        $('#blacklist-keyword-table tbody').append('<tr id="blacklist-keyword-row"></tr>');
        $('#blacklist-keyword-table tbody tr:eq(-1)').append('<td></td>');
        $('#blacklist-keyword-table tbody tr td:eq(-1)').append(document.createTextNode(blacklistKeyword[i][0]));
        $('#blacklist-keyword-table tbody tr:eq(-1)').append('<td>' + blacklistKeyword[i][1] + '</td>');
        const banned = Boolean(blacklistKeyword[i][2]);
        if (banned) {
            $('#blacklist-keyword-table tbody tr:eq(-1)').append('<td class="ion-eye-disabled" style="text-align: center; color: #dc3545;"></td>');
        } else {
            $('#blacklist-keyword-table tbody tr:eq(-1)').append('<td class="ion-eye" style="text-align: center; color: #28a745;"></td>');
        }
        $('#blacklist-keyword-table tbody tr:eq(-1)').append('<td style="text-align: center"><button class="ion-trash-b" id="blacklist-keyword-delete"></button></td>');
        $('#blacklist-keyword-table tbody tr:eq(-1)').append('<td style="text-align: center"><button class="ion-edit" id="blacklist-keyword-edit"></button></td>');
    }
    const deleteButton = document.querySelectorAll('button[id="blacklist-keyword-delete"]');
    const editButton = document.querySelectorAll('button[id="blacklist-keyword-edit"]');
    for (let i = 0; i < blacklistKeyword.length; i++) {
        deleteButton[i].addEventListener('click', function() {
            const confirmAction = confirm('해당 키워드를 블랙리스트에서 삭제합니다.');
            if (confirmAction) {
                blacklistKeyword.splice(i, 1);
                GM_setValue('blacklistKeyword', blacklistKeyword);
                renderBlacklistKeywordMenu();
            }
        });
        editButton[i].addEventListener('click', function() {
            $('#blacklist-keyword-textfield').val(blacklistKeyword[i][0]);
            $('#blacklist-keyword-slug-textfield').val(blacklistKeyword[i][1]);
        });
    }
    $('#blacklist-keyword-batch-textarea').val(JSON.stringify(blacklistKeyword, null, 4));
}

function blacklistBatchEditMenu() {
    const blacklistUser = GM_getValue('blacklistUser', []);
    $('#blacklist-user-batch-textarea').val(JSON.stringify(blacklistUser, null, 4));
    $('#blacklist-user-batch-edit').click(function() {
        const confirmAction = confirm('유저 블랙리스트 데이터를 완전히 덮어씌웁니다. 계속하시겠습니까?');
        if (confirmAction) {
            try {
                const data = JSON.parse($('#blacklist-user-batch-textarea').val());
                data.sort(sortTime);
                GM_setValue('blacklistUser', data);
                renderBlacklistUserMenu();
            } catch {
                alert('입력한 데이터를 다시 확인해주세요.');
            }
        }
    });

    const blacklistCategory = GM_getValue('blacklistCategory', []);
    $('#blacklist-category-batch-textarea').val(JSON.stringify(blacklistCategory, null, 4));
    $('#blacklist-category-batch-edit').click(function() {
        const confirmAction = confirm('탭 블랙리스트 데이터를 완전히 덮어씌웁니다. 계속하시겠습니까?');
        if (confirmAction) {
            try {
                const data = $('#blacklist-category-batch-textarea').val();
                GM_setValue('blacklistCategory', JSON.parse(data));
                renderBlacklistCategoryMenu();
            } catch {
                alert('입력한 데이터를 다시 확인해주세요.');
            }
        }
    });

    const blacklistKeyword = GM_getValue('blacklistKeyword', []);
    $('#blacklist-keyword-batch-textarea').val(JSON.stringify(blacklistKeyword, null, 4));
    $('#blacklist-keyword-batch-edit').click(function() {
        const confirmAction = confirm('키워드 블랙리스트 데이터를 완전히 덮어씌웁니다. 계속하시겠습니까?');
        if (confirmAction) {
            try {
                const data = $('#blacklist-keyword-batch-textarea').val();
                GM_setValue('blacklistKeyword', JSON.parse(data));
                renderBlacklistKeywordMenu();
            } catch {
                alert('입력한 데이터를 다시 확인해주세요.');
            }
        }
    });
}
blacklistBatchEditMenu();


const blockedTextAlt = document.createElement('span');
blockedTextAlt.style.cssText = `
    font-style: italic;
    opacity: 0.3;
    overflow: hidden;
    text-overflow: ellipsis;
    `;

const displayToggleButton = document.createElement('button');
displayToggleButton.setAttribute('id', 'display-toggle');
displayToggleButton.innerText = '표시';
displayToggleButton.style.cssText = `
    width: 2.5rem;
    padding: .1rem .1rem;
    flex-shrink: 0;
    border: 1px solid;
    border-radius: 3px;
    border-color: var(--color-bd-outer);
    background-color: var(--color-bg-main);
    color: var(--color-text-color);
    text-align: center;
    font-family: inherit;
    font-size: 85%;
    line-height: inherit;
    pointer-events: auto;
    `;

const blockedUserAlt = document.createElement('span');
blockedUserAlt.innerText = '(차단된 유저)';



// 지정한 카테고리의 글 차단
function blockCategory() {
    const category = document.querySelectorAll('span[class="categorys"]');
    const title = document.querySelectorAll('span[class="title"]');

    const blacklistCategory = GM_getValue('blacklistCategory', []);
    const blacklistCategoryNames = blacklistCategory.map(i => i[0]);
    const blacklistCategorySlugs = blacklistCategory.map(i => i[1]);
    const blacklistCategoryBools = blacklistCategory.map(i => i[2]);

    for (let i = 0; i < category.length; i++) {
        const index = blacklistCategoryNames.indexOf(category[i].innerText);
        if (postAuthors[i].getAttribute('data-filter') !== myUsername && index !== -1 && (blacklistCategorySlugs[index] === currentSlug || blacklistCategorySlugs[index] === '')) {
            if (blacklistCategoryBools[index]) {
                const warning = '차단된 태그로 작성된 글입니다.';
                titleToggle(i, warning, false);
            } else {
                title[i].parentNode.querySelector('span[class="title"]').style.opacity = '0.3';
                title[i].parentNode.querySelector('span[class="info"]').style.opacity = '0.3';
            }
        }
    }
}


// 지정한 키워드를 포함하는 글 차단
function blockTitle() {
    const title = document.querySelectorAll('span[class="title"]');

    const blacklistKeyword = GM_getValue('blacklistKeyword', []);

    for (let i = 0; i < title.length; i++) {
        const match = blacklistKeyword.filter(keyword => {
            const pattern = keyword[0].slice(1, keyword[0].lastIndexOf('/'));
            const flag = keyword[0].split('/').pop();
            const regex = new RegExp(pattern, flag);
            const keywordMatch = regex.test(title[i].innerText);
            const slugMatch = keyword[1] === currentSlug || keyword[1] === '';
            return keywordMatch && slugMatch;
        });
        if (postAuthors[i].getAttribute('data-filter') !== myUsername && match.length > 0) {
            if (match.map(keyword => keyword[2]).includes(true)) {
                const warning = '차단된 키워드가 포함된 제목입니다. (RegEx: ' + match.map(keyword => keyword[0]).toString() + ')';
                titleToggle(i, warning, false);
            } else {
                title[i].parentNode.querySelector('span[class="title"]').style.opacity = '0.3';
                title[i].parentNode.querySelector('span[class="info"]').style.opacity = '0.3';
            }
        }
    }

    const sideTitle = document.querySelectorAll('div[class="link-list"] a');
    for (let i = 0; i < sideTitle.length; i++) {
        const match = blacklistKeyword.filter(keyword => {
            const pattern = keyword[0].slice(1, keyword[0].lastIndexOf('/'));
            const flag = keyword[0].split('/').pop();
            const regex = new RegExp(pattern, flag);
            const keywordMatch = regex.test(sideTitle[i].innerText);
            const slugMatch = keyword[1] === currentSlug || keyword[1] === '';
            return keywordMatch && slugMatch;
        });
        if (match.length > 0) {
            if (match.map(keyword => keyword[2]).includes(true)) {
                const warning = '차단된 키워드가 포함된 제목입니다. (RegEx: ' + match.map(keyword => keyword[0]).toString() + ')';
                sideTitleToggle(i, warning);
            } else {
                title[i].parentNode.querySelector('span[class="title"]').style.opacity = '0.3';
                title[i].parentNode.querySelector('span[class="info"]').style.opacity = '0.3';
            }
        }
    }

}


GM_addStyle(`
    #user-wrapper {
        display: contents;
        word-break: keep-all;
        width: inherit;
    }
    #user-memo {
        position: absolute;
        z-index: 9999;
        min-width: 9.2rem;
        max-width: 15rem;
        overflow-wrap: break-word;
        white-space: normal;
        font-weight: normal;
        font-size: .85rem;
        color: #fff;
        background-color: #555;
        border-radius: 4px 4px 4px 4px;
        padding: .2rem .4rem;
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
        pointer-events: none;
    }
    #user-memo::after {
        content: '';
        position: absolute;
        top: 6px;
        right: 100%;
        border-width: 6px;
        border-style: solid;
        border-color: transparent #555 transparent transparent;
    }
    span.user-info:hover + #user-memo,
    span.user-info:hover ~ * ~ #user-memo {
        opacity: 1;
    }
`);

const userWrapper = document.createElement('div');
userWrapper.setAttribute('id', 'user-wrapper');

const userAlertIcon = document.createElement('span');
userAlertIcon.setAttribute('class', 'ion-android-alert');
userAlertIcon.style.color = '#dc3545';
userAlertIcon.style.marginLeft = '.3rem';

const userTooltip = document.createElement('div');
userTooltip.setAttribute('data-container', 'body');
userTooltip.setAttribute('id', 'user-memo');


function blockPostUser() {
    const blacklistUser = GM_getValue('blacklistUser', []);
    const blacklistUser_names = blacklistUser.map(i => i[0]);

    const title = document.querySelectorAll('span[class="title"]');
    if (title !== null) {
        const postUsernameList = []
        for (const i of postAuthors) {
            if (i.getAttribute('data-filter').includes(', ')) {
                postUsernameList.push(i.getAttribute('data-filter').split(', ')[1]);
            } else {
                postUsernameList.push(i.getAttribute('data-filter'));
            }
        }

        for (let i = 0; i < title.length; i++) {
            if (blacklistUser_names.includes(postUsernameList[i])) {
                const index = blacklistUser_names.indexOf(postUsernameList[i]);

                const userWrapper_clone = userWrapper.cloneNode(true);
                const userInfo = postAuthors[i].parentNode;
                userInfo.parentNode.insertBefore(userWrapper_clone, userInfo);
                userWrapper_clone.append(userInfo);

                postAuthors[i].parentNode.append(userAlertIcon.cloneNode(true));
                const userTooltip_clone = userTooltip.cloneNode(true);
                userTooltip_clone.style.transform = 'translateY(-' + postAuthors[i].offsetHeight + 'px)';
                userTooltip_clone.style.marginLeft = postAuthors[i].offsetWidth + 60 + 'px';
                userTooltip_clone.innerText = blacklistUser[index][1] ? blacklistUser[index][1] + '\n(' + convertTime(blacklistUser[index][3]) + ')' : '(' + convertTime(blacklistUser[index][3]) + ')';
                userWrapper_clone.append(userTooltip_clone);

                if (blacklistUser[index][2]) {
                    const warning = '차단된 유저가 작성한 글입니다.';
                    titleToggle(i, warning, true);
                }
            }
        }
    }

    const inPostAuthor = document.querySelector('div[class="article-head"] a[data-filter], div[class="article-head"] span[data-filter]');
    if (inPostAuthor !== null) {
        let inPostUsername;
        if (inPostAuthor.getAttribute('data-filter').includes(', ')) {
            inPostUsername = inPostAuthor.getAttribute('data-filter').split(', ')[1];
        } else {
            inPostUsername = inPostAuthor.getAttribute('data-filter');
        }

        if (blacklistUser_names.includes(inPostUsername)) {
            const index = blacklistUser_names.indexOf(inPostUsername);

            const memberInfo = document.querySelector('div[class="member-info"]');
            const userInfo = memberInfo.querySelector('span[class="user-info"]');

            inPostAuthor.parentNode.append(userAlertIcon.cloneNode(true));
            const userTooltip_clone = userTooltip.cloneNode(true);
            userTooltip_clone.style.transform = 'translateY(-' + userInfo.offsetHeight + 'px)';
            userTooltip_clone.style.marginLeft = userInfo.offsetWidth + 40 + 'px';
            userTooltip_clone.innerText = blacklistUser[index][1] ? blacklistUser[index][1] + '\n(' + convertTime(blacklistUser[index][3]) + ')' : '(' + convertTime(blacklistUser[index][3]) + ')';
            memberInfo.append(userTooltip_clone);
        }
    }
}


function blockCommentUser() {
    const blacklistUser = GM_getValue('blacklistUser', []);
    const blacklistUser_names = blacklistUser.map(i => i[0]);

    const comment = document.querySelectorAll('div[class="comment-item"], div[class="comment-item fadein"]');
    if (comment !== null) {
        const commentUsernameList = []
        for (const i of commentAuthors) {
            if (i.getAttribute('data-filter').includes(', ')) {
                commentUsernameList.push(i.getAttribute('data-filter').split(', ')[1]);
            } else {
                commentUsernameList.push(i.getAttribute('data-filter'));
            }
        }

        for (let i = 0; i < comment.length; i++) {
            if (blacklistUser_names.includes(commentUsernameList[i])) {
                const index = blacklistUser_names.indexOf(commentUsernameList[i]);

                const userWrapper_clone = userWrapper.cloneNode(true);
                const userInfo = commentAuthors[i].parentNode;
                userInfo.parentNode.insertBefore(userWrapper_clone, userInfo);
                userWrapper_clone.append(userInfo);
                userWrapper_clone.append(document.createTextNode(' '));
                userWrapper_clone.append(comment[i].querySelector('div[class="avatar"]'));

                commentAuthors[i].parentNode.append(userAlertIcon.cloneNode(true));
                const userTooltip_clone = userTooltip.cloneNode(true);
                userTooltip_clone.style.transform = 'translateY(-' + userInfo.offsetHeight + 'px)';
                userTooltip_clone.style.marginLeft = userInfo.offsetWidth + 40 + 'px';
                userTooltip_clone.innerText = blacklistUser[index][1] ? blacklistUser[index][1] + '\n(' + convertTime(blacklistUser[index][3]) + ')' : '(' + convertTime(blacklistUser[index][3]) + ')';
                userWrapper_clone.append(userTooltip_clone);

                if (blacklistUser[index][2]) {
                    const warning = '차단된 유저가 작성한 댓글입니다.';
                    commentToggle(i, warning, true);
                }
            }
        }
    }
}


blockPostUser();
blockCommentUser();
blockCategory();
blockTitle();



// 글 목록 중 차단된 게시글 토글
function titleToggle(i, warning, byUser) {
    const title = document.querySelectorAll('span[class="title"]');
    const currentRow = title[i].closest('a[class="vrow column"], a[class="vrow column active"]');

    if (currentRow.querySelector('button[id="display-toggle"]') === null) {
        const displayToggleButton_clone = displayToggleButton.cloneNode(true);
        title[i].parentNode.insertBefore(displayToggleButton_clone, title[i]);
        currentRow.style.pointerEvents = 'none';

        const blockedTextAlt_clone = blockedTextAlt.cloneNode(true);
        blockedTextAlt_clone.append(document.createTextNode(warning));
        title[i].parentNode.insertBefore(blockedTextAlt_clone, title[i]);
        title[i].style.display = 'none';

        const preview = currentRow.querySelector('div[class="vrow-preview"]');
        if (preview !== null) {
            preview.style.display = 'none';
        }

        let userWrapper;
        let blockedUserAlt_clone;
        if (byUser) {
            userWrapper = currentRow.querySelector('div[id="user-wrapper"]');
            userWrapper.style.display = 'none';
            blockedUserAlt_clone = blockedUserAlt.cloneNode(true);
            currentRow.querySelector('span[class="vcol col-author"]').append(blockedUserAlt_clone);
        }

        displayToggleButton_clone.addEventListener('click', function() {
            event.preventDefault();
            currentRow.style.pointerEvents = currentRow.style.pointerEvents === 'none' ? '' : 'none';
            displayToggleButton_clone.innerText = displayToggleButton_clone.innerText === '표시' ? '숨김' : '표시';
            blockedTextAlt_clone.style.display = blockedTextAlt_clone.style.display === 'none' ? '' : 'none';
            title[i].style.display = title[i].style.display === 'none' ? '' : 'none';
            if (preview !== null) {
                preview.style.display = preview.style.display === 'none' ? '' : 'none';
            }
            if (byUser) {
                userWrapper.style.display = userWrapper.style.display === 'none' ? '' : 'none';
                blockedUserAlt_clone.style.display = blockedUserAlt_clone.style.display === 'none' ? '' : 'none';
            }
        });
    }
}


// 사이드바 중 차단된 게시글 토글
function sideTitleToggle(i, warning) {
    const sideTitle = document.querySelectorAll('div[class="link-list"] a');
    const wrapper = document.createElement('span');
    wrapper.style.display = 'flex';
    wrapper.style.whiteSpace = 'nowrap';

    if (sideTitle[i].querySelector('button[id="display-toggle"]') === null) {
        const displayToggleButton_clone = displayToggleButton.cloneNode(true);
        const wrapper_clone = wrapper.cloneNode(true);
        sideTitle[i].parentNode.insertBefore(wrapper_clone, sideTitle[i]);
        wrapper_clone.append(displayToggleButton_clone);
        wrapper_clone.append(sideTitle[i]);

        const blockedTextAlt_clone = blockedTextAlt.cloneNode(true);
        blockedTextAlt_clone.append(document.createTextNode(warning));
        wrapper_clone.insertBefore(blockedTextAlt_clone, sideTitle[i]);
        sideTitle[i].style.display = 'none';

        const preview = sideTitle[i].querySelector('div[class="vrow-preview"]');
        if (preview !== null) {
            preview.style.display = 'none';
        }

        displayToggleButton_clone.addEventListener('click', function() {
            event.preventDefault();
            displayToggleButton_clone.innerText = displayToggleButton_clone.innerText === '표시' ? '숨김' : '표시';
            blockedTextAlt_clone.style.display = blockedTextAlt_clone.style.display === 'none' ? '' : 'none';
            sideTitle[i].style.display = sideTitle[i].style.display === 'none' ? '' : 'none';
            if (preview !== null) {
                preview.style.display = preview.style.display === 'none' ? '' : 'none';
            }
        });
    }
}


// 차단된 댓글 토글
function commentToggle(i, warning, byUser) {
    const comment = document.querySelectorAll('div[class="comment-item"], div[class="comment-item fadein"]');

    if (comment[i].querySelector('div[class="message"] button') === null) {
        const commentMessage = comment[i].querySelector('div[class="message"]');
        let commentContent;
        if (comment[i].querySelector('div[class="message"] div[class="text"]') !== null) {
            commentContent = comment[i].querySelector('div[class="message"] div[class="text"]');
        } else {
            commentContent = comment[i].querySelector('div[class="message"] div[class="emoticon-wrapper"]');
        }

        const blockedTextAlt_clone = blockedTextAlt.cloneNode(true);
        blockedTextAlt_clone.append(document.createTextNode(warning));
        commentMessage.append(blockedTextAlt_clone);
        commentContent.style.display = 'none';

        const displayToggleButton_clone = displayToggleButton.cloneNode(true);
        commentMessage.insertBefore(displayToggleButton_clone, commentMessage.firstChild);

        const modified = comment[i].querySelector('b[class="modified"]');
        if (modified !== null) {
            modified.style.display = 'none';
        }

        let userWrapper;
        let blockedUserAlt_clone;
        if (byUser) {
            userWrapper = comment[i].querySelector('div[id="user-wrapper"]');
            userWrapper.style.display = 'none';
            blockedUserAlt_clone = blockedUserAlt.cloneNode(true);
            comment[i].querySelector('div[class="info-row clearfix"]').insertBefore(blockedUserAlt_clone, comment[i].querySelector('div[class="right"]'));
        }

        displayToggleButton_clone.addEventListener('click', function() {
            event.preventDefault();
            displayToggleButton_clone.innerText = displayToggleButton_clone.innerText === '표시' ? '숨김' : '표시';
            blockedTextAlt_clone.style.display = blockedTextAlt_clone.style.display === 'none' ? '' : 'none';
            commentContent.style.display = commentContent.style.display === 'none' ? '' : 'none';
            if (modified !== null) {
                modified.style.display = modified.style.display === 'none' ? '' : 'none';
            }
            if (byUser) {
                userWrapper.style.display = userWrapper.style.display === 'none' ? '' : 'none';
                blockedUserAlt_clone.style.display = blockedUserAlt_clone.style.display === 'none' ? '' : 'none';
            }
        });
    }
}


// 댓글 목록 업데이트 시 차단된 댓글 갱신
function renderAgain() {
    if (document.getElementById('comment') !== null) {
        const commentSection = document.getElementById('comment');
        const observer = new MutationObserver(function() {
            commentAuthors = document.querySelectorAll('div[class="comment-wrapper"] a[data-filter], div[class="comment-wrapper"] span[data-filter]');
            highlightMe();
            antiFish();
            blockCommentUser();
            anonify();
        });
        observer.observe(commentSection, { childList: true });
    }
}
renderAgain();
