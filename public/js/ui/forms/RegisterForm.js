/**
 * Класс RegisterForm управляет формой
 * регистрации
 * */
 class RegisterForm extends AsyncForm {
  /**
   * Производит регистрацию с помощью User.register
   * После успешной регистрации устанавливает
   * состояние App.setState( 'user-logged' )
   * и закрывает окно, в котором находится форма
   * */
  onSubmit(data) {
    User.register(data, () => {
        const modal = App.getModal('register');
        this.form.reset();
        App.setState('user-logged');
        modal.close();
        console.log(`Пользователь ${data.name} успешно зарегистрирован`);
    })
  }
}