/**
 * Класс AccountsWidget управляет блоком
 * отображения счетов в боковой колонке
 * */

 class AccountsWidget {
  /**
   * Устанавливает текущий элемент в свойство element
   * Регистрирует обработчики событий с помощью
   * AccountsWidget.registerEvents()
   * Вызывает AccountsWidget.update() для получения
   * списка счетов и последующего отображения
   * Если переданный элемент не существует,
   * необходимо выкинуть ошибку.
   * */
  constructor( element ) {
    if (!element) {
      throw new Error('Ошибка конструктора класса AccountsWidget, пустое значение "element"');
    };
    this.element = element;
    this.registerEvents();
    this.update();
  }

  /**
   * При нажатии на .create-account открывает окно
   * #modal-new-account для создания нового счёта
   * При нажатии на один из существующих счетов
   * (которые отображены в боковой колонке),
   * вызывает AccountsWidget.onSelectAccount()
   * */
  registerEvents() {
    this.element.addEventListener('click', (e) => {
      if (e.target.classList.contains('create-account')) {
        App.getModal('createAccount').open();
      }
    });
  }

  /**
   * Метод доступен только авторизованным пользователям
   * (User.current()).
   * Если пользователь авторизован, необходимо
   * получить список счетов через Account.list(). При
   * успешном ответе необходимо очистить список ранее
   * отображённых счетов через AccountsWidget.clear().
   * Отображает список полученных счетов с помощью
   * метода renderItem()
   * */
  update() {
    const currentUser = User.current();
    if (currentUser) {
      Account.list({}, (err, response) => {
        if (err) {
          console.log(err);
        } else if (!response.success) {
          console.log(response.error);
        } else if (response.success) {
          this.clear();
          this.renderItem(response.data);
        };
      });
    }
  }

  /**
   * Очищает список ранее отображённых счетов.
   * Для этого необходимо удалять все элементы .account
   * в боковой колонке
   * */
  clear() {
    Array.from(this.element.querySelectorAll('.account')).forEach((item) => {
      this.element.removeChild(item);
    })
  }

  /**
   * Срабатывает в момент выбора счёта
   * Устанавливает текущему выбранному элементу счёта
   * класс .active. Удаляет ранее выбранному элементу
   * счёта класс .active.
   * Вызывает App.showPage( 'transactions', { account_id: id_счёта });
   * */
  onSelectAccount(element) {
    const activeAccount = this.element.querySelector('.active');
    if (activeAccount) {
      activeAccount.classList.remove('active');
    };
    element.classList.add('active');
    App.showPage('transactions', {account_id: element.dataset.id})
  }

  /**
   * Возвращает HTML-код счёта для последующего
   * отображения в боковой колонке.
   * item - объект с данными о счёте
   * */
  getAccountHTML(item){
    const account = document.createElement('li');
    const infoBox = document.createElement('a');
    const accountName = document.createElement('span');
    const accountBalance = document.createElement('span');
    
    account.className = 'account';
    account.dataset.id = item.id;
    infoBox.href = '#';
    accountName.textContent = `${item.name}: `;
    accountBalance.textContent = `${item.sum} ₽`;

    infoBox.appendChild(accountName);
    infoBox.appendChild(accountBalance);
    account.appendChild(infoBox);

    account.addEventListener('click', () => {
      this.onSelectAccount(account);
    });

    return account;
  }

  /**
   * Получает массив с информацией о счетах.
   * Отображает полученный с помощью метода
   * AccountsWidget.getAccountHTML HTML-код элемента
   * и добавляет его внутрь элемента виджета
   * */
  renderItem(data){
    data.forEach((item) => {
      this.element.appendChild(this.getAccountHTML(item));
    });
  }
}