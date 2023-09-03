{
  class Item {
    set amount(value) {
      const val = parseInt(value);
      this._amount = this.amountEl.value = (isNaN(val) || val <= 0) ? 1 : val;

      const price = (this.amount * this.price).toFixed(2);
      const priceOld = (this.amount * this.priceOld).toFixed(2);

      this.priceEl.textContent = `$${price}`;
      this.priceOldEl.textContent = `$${priceOld}`;

      if (typeof this.amountChangedCallback === 'function') {
        this.amountChangedCallback();
      }
    }

    get amount() {
      return this._amount;
    }

    constructor(opts) {
      const {amount, price, priceOld, el, amountChangedCallback} = opts;

      this.el = el;
      this._amount = amount;
      this.price = price;
      this.priceOld = priceOld;
      this.amountChangedCallback = amountChangedCallback;

      this.priceEl = el.querySelector('.item__price :first-child');
      this.priceOldEl = el.querySelector('.item__price span + span');
      this.amountEl = el.querySelector('.item__amount .amount');
      this.addEl = el.querySelector('.item__amount .add');
      this.subEl = el.querySelector('.item__amount .subtract');

      this.amountEl.addEventListener('blur', this.amountChanged.bind(this));
      this.addEl.addEventListener('click', this.add.bind(this));
      this.subEl.addEventListener('click', this.sub.bind(this));

      this.priceEl.textContent = `$${price}`;
      this.priceOldEl.textContent = `$${priceOld}`;
      this.amountEl.value = amount;
    }

    amountChanged(e) {
      this.amount = e.target.value;
    }

    add() {
      this.amount++;
    }

    sub() {
      this.amount--;
    }
  }

  const item1 = new Item({
    amount: 1,
    price: 54.99,
    priceOld: 94.99,
    el: document.getElementById('item1'),
    amountChangedCallback: amountChanged,
  });

  const item2 = new Item({
    amount: 1,
    price: 74.99,
    priceOld: 124.99,
    el: document.getElementById('item2'),
    amountChangedCallback: amountChanged,
  });

  const totalEl = document.getElementById('total');
  const items = [item1, item2];

  function amountChanged() {
    const total = items.reduce((prev, item) => {
      prev += item.amount * item.price;
      return prev;
    }, 0);

    totalEl.textContent = `$${total.toFixed(2)}`;
  }
}