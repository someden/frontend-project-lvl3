const renderForm = (elements, state, i18next) => {
  const { formProcess: { status, error } } = state;
  const { urlInput, feedback } = elements;

  switch (status) {
    case 'filling':
      urlInput.classList.remove('is-invalid');
      feedback.classList.remove('text-danger');
      feedback.textContent = '';
      break;
    case 'invalid':
      urlInput.classList.add('is-invalid');
      feedback.classList.add('text-danger');
      feedback.textContent = i18next.t([`errors.${error}`, 'errors.unknown']);
      break;
    default:
      break;
  }
};

const render = (elements, state, i18next, path) => {
  console.log('path', path);
  switch (path) {
    case 'formProcess':
      renderForm(elements, state, i18next);
      break;
    default:
      break;
  }
};

export default render;
