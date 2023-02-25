/**
 * Основная функция для совершения запросов
 * на сервер.
 * */
 const createRequest = (options = {}) => {
    const xhr = new XMLHttpRequest;
    xhr.responseType = 'json';
    const formData = new FormData();

    xhr.onload = () => {
        if (xhr.status !== 200) {
            options.callback(`${xhr.status}: ${xhr.statusText}`);
        } else if (!xhr.response.success) {
            options.callback(xhr.response.error);
        } else if (xhr.response.success) {
            options.callback(null, xhr.response);
        };
    };

    xhr.onerror = () => {
        console.log('Сбой соединения!');
    };

    if (options.method === 'GET') {
        for (item in options.data) {
            options.url += `?${item}=${options.data[item]}`;
        }
    } else {
        for (item in options.data) {
            formData.append(item, options.data[item]);
        }
    }

    xhr.open(options.method, options.url);

    if (formData) {
        xhr.send(formData);
        return;
    }
    
    xhr.send();

};