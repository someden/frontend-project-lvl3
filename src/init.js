import i18next from 'i18next';
import onChange from 'on-change';
import * as yup from 'yup';

import resources from './locales/index.js';
import render from './render.js';

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
      console.log(feedUrls);
      return schema.validate(url);
    };

    elements.form.addEventListener('submit', (event) => {
      event.preventDefault();

      const formData = new FormData(event.target);
      const url = formData.get('url').trim();

      validate(url, state.feeds).then(() => {
        state.formProcess = { status: 'filling', error: null };
      }).catch((error) => {
        state.formProcess = { status: 'invalid', error: error.message };
      });
    });
  });
};
