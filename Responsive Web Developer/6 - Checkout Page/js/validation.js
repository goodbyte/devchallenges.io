{
  class Validator {
    constructor(formID) {
      this.formEl = document.getElementById(formID);

      if (!this.formEl) throw new TypeError(`Form element doesn't exist`);

      this.formEl.setAttribute('novalidate', true);
      const formObj = this._getFormDataObject();

      Object.keys(formObj).forEach((name) => {
        this._getFormElementsByName(name).forEach((el) => {
          el.addEventListener('blur', this._checkValidity.bind(this, name))
        });
      });

      this.formEl.addEventListener('submit', this._onSubmit.bind(this));
    }

    _getFormElementsByName(name) {
      return this.formEl.querySelectorAll(`[name="${name}"]`);
    }

    _checkValidity(name) {
      const el = this._getFormElementsByName(name)[0];
      const isValid = el.checkValidity();

      const parentEl = el.parentElement.parentElement;
      let errorEl = parentEl.querySelector('.error');

      if (isValid) {
        if (errorEl) errorEl.classList.add('error--hidden');
        return;
      }

      if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.classList.add('error');
        parentEl.appendChild(errorEl);
      }

      errorEl.innerHTML = el.validationMessage;
    }

    _onSubmit(e) { 
      e.preventDefault();

      const isValid = this.formEl.checkValidity();
      const formObj = this._getFormDataObject();
      
      Object.keys(formObj).forEach((name) => this._checkValidity(name));

      if (typeof this.onFormSubmit === 'function') {
        this.onFormSubmit(isValid);
      }
    }

    _getFormDataObject() {
      const formArr = Array.from(new FormData(this.formEl));

      const formObj = formArr.reduce((acc, cur) => {
        const [key, val] = cur;

        Array.isArray(acc[key]) ?
          acc[key].push(val) :
          acc[key] = [val];

        return acc;
      }, {});

      return formObj;
    }
  }

  // select validation workaround
  const selectEl = document.querySelector('select[name=country]');

  selectEl.addEventListener('change', () => {
    selectEl.querySelector(':first-child').setAttribute('disabled', true);
  }, {once: true});
  // end

  const validator = new Validator('myForm');
  
  validator.onFormSubmit = (isValid) => {
    const formEl = document.getElementById('myForm');
    let messageEl = formEl.querySelector('.form-result');

    if (!messageEl) {
      messageEl = document.createElement('div');
      messageEl.classList.add('form-result');
      formEl.prepend(messageEl);
    }

    if (isValid) {
      messageEl.textContent = '✓ Form submitted successfully!';
      messageEl.classList.remove('form-result--error');
      messageEl.classList.add('form-result--ok');
    } else {
      messageEl.textContent = '⚠ There are items that require your attention!';
      messageEl.classList.remove('form-result--ok');
      messageEl.classList.add('form-result--error');
    }

    messageEl.scrollIntoView();
    window.scrollBy(0, -20);
  };
}