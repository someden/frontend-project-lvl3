import axios from 'axios';
import i18next from 'i18next';
import uniqueId from 'lodash/uniqueId.js';
import onChange from 'on-change';
import * as yup from 'yup';

import resources from './locales/index.js';
import parse from './parser.js';
import render from './render.js';

const addProxy = (url) => {
  const urlWithProxy = new URL('https://allorigins.hexlet.app/get');
  urlWithProxy.searchParams.set('url', url);
  urlWithProxy.searchParams.set('disableCache', 'true');
  return urlWithProxy.toString();
};

const getErrorCode = (error) => {
  if (error.isParsingError) {
    return 'noRss';
  }
  if (error.isAxiosError) {
    return 'network';
  }
  return 'unknown';
};

const loadRss = (state, url) => {
  state.loadingProcess = { status: 'loading', error: null };
  return axios.get(addProxy(url))
    .then((response) => {
      const parsedData = parse(response.data.contents);
      const feed = {
        url, id: uniqueId(), title: parsedData.title, description: parsedData.descrpition,
      };
      const posts = parsedData.posts.map((post) => ({ ...post, feedId: feed.id, id: uniqueId() }));
      state.posts.push(...posts);
      state.feeds.push(feed);

      state.loadingProcess = { status: 'success', error: null };
    })
    .catch((error) => {
      state.loadingProcess = { status: 'failed', error: getErrorCode(error) };
    });
};

const updateRss = (state) => {
  const promises = state.feeds.map((feed) => axios.get(addProxy(feed.url))
    .then((response) => {
      const parsedData = parse(response.data.contents);
      const existedPostsLinks = state.posts
        .filter((post) => post.feedId === feed.id)
        .map((post) => post.link);
      const newPosts = parsedData.posts
        .filter((post) => !existedPostsLinks.includes(post.link))
        .map((post) => ({ ...post, id: uniqueId(), feedId: feed.id }));

      state.posts.push(...newPosts);
    })
    .catch((error) => {
      console.log(error);
    }));

  return Promise.all(promises).finally(() => {
    setTimeout(() => updateRss(state), 5000);
  });
};

export default () => {
  const i18nInstance = i18next.createInstance();

  i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then(() => {
    const elements = {
      form: document.querySelector('.rss-form'),
      urlInput: document.querySelector('#url-input'),
      feedback: document.querySelector('.feedback'),
      submit: document.querySelector('.rss-form button[type="submit"]'),
      postsBox: document.querySelector('.posts'),
      feedsBox: document.querySelector('.feeds'),
      modal: document.querySelector('#modal'),
    };

    const initialState = {
      loadingProcess: {
        status: 'idle',
        error: null,
      },
      formProcess: {
        status: 'filling',
        error: null,
      },
      feeds: [],
      posts: [],
      ui: {
        modalPostId: null,
        viewedPostsIds: [],
      },
    };

    const state = onChange(initialState, (path) => render(elements, state, i18nInstance, path));

    yup.setLocale({
      string: {
        url: () => 'notUrl',
      },
      mixed: {
        required: () => 'required',
        notOneOf: () => 'exists',
      },
    });

    const validate = (url, feeds) => {
      const feedUrls = feeds.map((feed) => feed.url);
      const schema = yup.string().url().required().notOneOf(feedUrls);
      return schema.validate(url);
    };

    elements.form.addEventListener('submit', (event) => {
      event.preventDefault();

      const formData = new FormData(event.target);
      const url = formData.get('url').trim();

      state.formProcess = { status: 'validation', error: null };
      validate(url, state.feeds).then(() => {
        state.formProcess = { status: 'filling', error: null };
        loadRss(state, url);
      }).catch((error) => {
        state.formProcess = { status: 'invalid', error: error.message };
      });
    });

    elements.postsBox.addEventListener('click', (event) => {
      const { id } = event.target.dataset;
      if (!id) {
        return;
      }

      state.ui.modalPostId = id;
      if (!state.ui.viewedPostsIds.includes(id)) {
        state.ui.viewedPostsIds.push(id);
      }
    });

    updateRss(state);
  });
};
