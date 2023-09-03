const renderForm = (elements, state, i18next) => {
  const { urlInput, feedback, submit } = elements;
  const { formProcess: { status, error } } = state;

  switch (status) {
    case 'filling':
      submit.disabled = false;
      urlInput.classList.remove('is-invalid');
      feedback.classList.remove('text-danger');
      feedback.textContent = '';
      break;
    case 'validation':
      submit.disabled = true;
      break;
    case 'invalid':
      submit.disabled = false;
      urlInput.classList.add('is-invalid');
      feedback.classList.add('text-danger');
      feedback.textContent = i18next.t([`errors.${error}`, 'errors.unknown']);
      break;
    default:
      break;
  }
};

const renderLoading = (elements, state, i18next) => {
  const { urlInput, feedback, submit } = elements;
  const { loadingProcess: { status, error } } = state;

  switch (status) {
    case 'failed':
      submit.disabled = false;
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      feedback.textContent = i18next.t([`errors.${error}`, 'errors.unknown']);
      break;
    case 'success':
      submit.disabled = false;
      urlInput.value = '';
      urlInput.focus();
      feedback.classList.add('text-success');
      feedback.classList.remove('text-danger');
      feedback.textContent = i18next.t('loading.success');
      break;
    case 'loading':
      submit.disabled = true;
      feedback.classList.remove('text-success');
      feedback.classList.remove('text-danger');
      feedback.textContent = '';
      break;
    default:
      break;
  }
};

const getCard = (title) => {
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  card.appendChild(cardBody);
  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = title;
  cardBody.appendChild(cardTitle);
  return card;
};

const renderFeeds = (elements, state, i18next) => {
  const { feedsBox } = elements;
  const { feeds } = state;

  const card = getCard(i18next.t('feeds'));

  const feedsList = document.createElement('ul');
  feedsList.classList.add('list-group', 'border-0', 'rounded-0');

  const feedsListElements = feeds.map((feed) => {
    const feedEl = document.createElement('li');
    feedEl.classList.add('list-group-item', 'border-0', 'border-end-0');
    const titleEl = document.createElement('h3');
    titleEl.classList.add('h6', 'm-0');
    titleEl.textContent = feed.title;
    const descriptionEl = document.createElement('p');
    descriptionEl.classList.add('m-0', 'small', 'text-black-50');
    descriptionEl.textContent = feed.description;
    feedEl.append(titleEl, descriptionEl);
    return feedEl;
  });

  feedsList.append(...feedsListElements);
  card.appendChild(feedsList);
  feedsBox.innerHTML = '';
  feedsBox.appendChild(card);
};

const renderPosts = (elements, state, i18next) => {
  const { postsBox } = elements;
  const { posts, ui } = state;

  const card = getCard(i18next.t('posts'));

  const postsList = document.createElement('ul');
  postsList.classList.add('list-group', 'border-0', 'rounded-0');

  const postsListElements = posts.map((post) => {
    const postEl = document.createElement('li');
    postEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const linkEl = document.createElement('a');
    linkEl.setAttribute('href', post.link);
    const className = ui.viewedPostsIds.includes(post.id) ? ['fw-normal', 'link-secondary'] : ['fw-bold'];
    linkEl.classList.add(...className);
    linkEl.dataset.id = post.id;
    linkEl.textContent = post.title;
    linkEl.setAttribute('target', '_blank');
    linkEl.setAttribute('rel', 'noopener noreferrer');
    postEl.appendChild(linkEl);
    const buttonEl = document.createElement('button');
    buttonEl.setAttribute('type', 'button');
    buttonEl.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    buttonEl.dataset.id = post.id;
    buttonEl.dataset.bsToggle = 'modal';
    buttonEl.dataset.bsTarget = '#modal';
    buttonEl.textContent = i18next.t('preview');
    postEl.appendChild(buttonEl);
    return postEl;
  });

  postsList.append(...postsListElements);
  card.appendChild(postsList);
  postsBox.innerHTML = '';
  postsBox.appendChild(card);
};

const render = (elements, state, i18next, path) => {
  console.log('path', path);
  switch (path) {
    case 'formProcess':
      renderForm(elements, state, i18next);
      break;
    case 'loadingProcess':
      renderLoading(elements, state, i18next);
      break;
    case 'feeds':
      renderFeeds(elements, state, i18next);
      break;
    case 'posts':
      renderPosts(elements, state, i18next);
      break;
    default:
      break;
  }
};

export default render;
