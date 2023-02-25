// const { response } = require("express");

/**
 * Класс TransactionsPage управляет
 * страницей отображения доходов и
 * расходов конкретного счёта
 * */
 class TransactionsPage {
  /**
   * Если переданный элемент не существует,
   * необходимо выкинуть ошибку.
   * Сохраняет переданный элемент и регистрирует события
   * через registerEvents()
   * */
  constructor(element) {
    if (!element) {
      throw new Error('Ошибка конструктора класса TransactionsPage, пустое значение "element"');
    };
    this.element = element;
    this.accountTitle = this.element.querySelector('.content-title');
    this.contentHeader = this.element.querySelector('.content-header');
    this.content = this.element.querySelector('.content');
    this.registerEvents();
  }

  /**
   * Вызывает метод render для отрисовки страницы
   * */
  update() {
    this.render();
  }

  /**
   * Отслеживает нажатие на кнопку удаления транзакции
   * и удаления самого счёта. Внутри обработчика пользуйтесь
   * методами TransactionsPage.removeTransaction и
   * TransactionsPage.removeAccount соответственно
   * */
  registerEvents() {
    this.content.addEventListener('click', (e) => {
      const target = e.target;

      if (target.closest('.transaction__remove').classList.contains('transaction__remove')) {
        this.removeTransaction(target.closest('.transaction__remove').dataset.id);
      };
    })
    
    this.contentHeader.addEventListener('click', (e) => {
      const target = e.target;

      if (target.closest('.remove-account').classList.contains('remove-account')) {
        if (!this.lastOptions) {
          console.log('Сначала выберете счет');
          return;
        }
          this.removeAccount();
      };
    })
  }

  /**
   * Удаляет счёт. Необходимо показать диаголовое окно (с помощью confirm())
   * Если пользователь согласен удалить счёт, вызовите
   * Account.remove, а также TransactionsPage.clear с
   * пустыми данными для того, чтобы очистить страницу.
   * По успешному удалению необходимо вызвать метод App.updateWidgets() и App.updateForms(),
   * либо обновляйте только виджет со счетами и формы создания дохода и расхода
   * для обновления приложения
   * */
  removeAccount() {
    if (!confirm('Удалить текущий счет?')) {
      return;
    };

    Account.remove({id: this.lastOptions.account_id}, (err, response) => {
      if (err) {
        console.log(err);
      } else if (!response.success) {
        console.log(response.error);
      } else if (response.success) {
        this.clear();
        App.updateWidgets();
        App.updateForms();
      };
    })
  };

  /**
   * Удаляет транзакцию (доход или расход). Требует
   * подтверждеия действия (с помощью confirm()).
   * По удалению транзакции вызовите метод App.update(),
   * либо обновляйте текущую страницу (метод update) и виджет со счетами
   * */
  removeTransaction(id) {
    if (!confirm('Удалить выбранную транзакцию?')) {
      return;
    };

    Transaction.remove({id: id}, (err, response) => {
        if (err) {
          console.log(err);
        } else if (!response.success) {
          console.log(response.error);
        } else if (response.success) {
          this.update();
          App.updateWidgets();
        }
    })
  }

  /**
   * С помощью Account.get() получает название счёта и отображает
   * его через TransactionsPage.renderTitle.
   * Получает список Transaction.list и полученные данные передаёт
   * в TransactionsPage.renderTransactions()
   * */
  render(options = this.lastOptions){
    if (!options) {
      return;
    };

    this.content.innerHTML = '';

    this.lastOptions = options;
    
    Account.get(options.account_id, (err, response) => {
      if (err) {
        console.log(err);
      } else if (!response.success) {
        console.log(response.error);
      } else if (response.success) {
        const accountName = response.data.find((item) => {
        return item.id === options.account_id;
        }).name;

        if (accountName) {
          Transaction.list(options, (err, response) => {
            if (err) {
              console.log(err);
              return;
            } else if (!response.success) {
              console.log(response.error);
            } else if (response.success) {
              if (response.data.length > 0) {
                this.renderTransactions(response.data);
              };
            };
          })

          this.renderTitle(accountName);
        };
      }
    })
  }

  /**
   * Очищает страницу. Вызывает
   * TransactionsPage.renderTransactions() с пустым массивом.
   * Устанавливает заголовок: «Название счёта»
   * */
  clear() {
    this.renderTransactions([]);
    this.renderTitle('Название счёта')
    this.lastOptions = null;
  }

  /**
   * Устанавливает заголовок в элемент .content-title
   * */
  renderTitle(name){
    this.accountTitle.textContent = name;
  }

  /**
   * Форматирует дату в формате 2019-03-10 03:20:41 (строка)
   * в формат «10 марта 2019 г. в 03:20»
   * */
  formatDate(date){
    const itemDate = new Date(date);
    const hours = itemDate.getHours().toString().length === 1 ? `0${itemDate.getHours()}`: itemDate.getHours();
    const minutes = itemDate.getMinutes().toString().length === 1 ? `0${itemDate.getMinutes()}`: itemDate.getMinutes();
    return `${itemDate.toLocaleDateString('ru-RU', {year: 'numeric', month: 'long', day: 'numeric'})} в ${hours}:${minutes}`;
  }

  /**
   * Формирует HTML-код транзакции (дохода или расхода).
   * item - объект с информацией о транзакции
   * */
  getTransactionHTML(item){
    return `<div class="transaction transaction_${item.type} row">
                <div class="col-md-7 transaction__details">
                  <div class="transaction__icon">
                      <span class="fa fa-money fa-2x"></span>
                  </div>
                  <div class="transaction__info">
                      <h4 class="transaction__title">${item.name}</h4>
                      <div class="transaction__date">${this.formatDate(item.created_at)}</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="transaction__summ">
                  ${item.sum} <span class="currency">₽</span>
                  </div>
                </div>
                <div class="col-md-2 transaction__controls">
                    <button class="btn btn-danger transaction__remove" data-id="${item.id}">
                        <i class="fa fa-trash"></i>  
                    </button>
                </div>
            </div>`
  }

  /**
   * Отрисовывает список транзакций на странице
   * используя getTransactionHTML
   * */
  renderTransactions(data){
    if (data.length === 0) {
      this.content.innerHTML = '';
      return;
    }

    data.reduce((htmlText, item, idx) => {
      if (idx + 1 === data.length) {
        htmlText += this.getTransactionHTML(item);
        this.content.innerHTML = htmlText;
      }
      return htmlText += this.getTransactionHTML(item);
    }, '');
  }
}