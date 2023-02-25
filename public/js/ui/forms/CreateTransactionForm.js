/**
 * Класс CreateTransactionForm управляет формой
 * создания новой транзакции
 * */
 class CreateTransactionForm extends AsyncForm {
  /**
   * Вызывает родительский конструктор и
   * метод renderAccountsList
   * */
  constructor(element) {
    super(element);
    this.renderAccountsList();
  }

  /**
   * Получает список счетов с помощью Account.list
   * Обновляет в форме всплывающего окна выпадающий список
   * */
  renderAccountsList() {
    const currentUser = User.current();
    
    if (currentUser) {
      Account.list({}, (err, response) => {
        if (err) {
          console.log(err);
        } else if (!response.success) {
          console.log(response.error);
        } else if (response.success) {
          const currentList = this.form.querySelector(`.accounts-select`);

          const accountList = response.data;
          accountList.reduce((htmlText, item, idx) => {
            if (idx + 1 === accountList.length) {
              htmlText += `<option value="${item.id}">${item.name}</option>`
              currentList.innerHTML = htmlText;
            };

            return htmlText += `<option value="${item.id}">${item.name}</option>`;
          }, '');
        };
      });
    }
  }

  /**
   * Создаёт новую транзакцию (доход или расход)
   * с помощью Transaction.create. По успешному результату
   * вызывает App.update(), сбрасывает форму и закрывает окно,
   * в котором находится форма
   * */
  onSubmit(data) {
    Transaction.create(data, (err, response) => {
      if (err) {
        console.log(err);
      } else if (!response.success) {
        console.log(response.error);
      } else if (response.success) {
        this.form.reset();

        if (this.form.id === 'new-expense-form') {
          App.getModal('newExpense').close();
        } else if (this.form.id === 'new-income-form') {
          App.getModal('newIncome').close();
        }
        
        App.update();
      }
    })
  }
}