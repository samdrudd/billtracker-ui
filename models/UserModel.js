class User {
    constructor(id, username, email, token) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.token = token;
    }
}

class UserModel {
    constructor() {
        this.route = API.URL + 'users';
        this.user = null;
        this.observers = [];
    }

    addObserver(observer) {
        this.observers.push(observer);
    }

    removeObserver(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    notifyObservers() {
        this.observers.forEach(observer => observer.update(this.user));
    }

    tokenAuth(successCallback, errorCallback) {  
        $.ajax({
            url: this.route + '/tokenAuth',
            method: 'POST',
            context: this,
            data: {
                token: localStorage.getItem('billtrackerAuth')
            },
            success: function(data) {
                this.user = new User(data.user.id, data.user.username, data.user.email, data.user.token);
                localStorage.setItem('billtrackerAuth', data.user.token);
                this.notifyObservers();
                successCallback();
            },
            error: function(error) {
                console.error('Error authenticating with token: ', error);
                localStorage.removeItem('billtrackerAuth');
                this.user = null;
                this.notifyObservers();
                errorCallback(error);
            }
        });
    }

    login(username, password, successCallback, errorCallback) {
        $.ajax({
            url: this.route + '/login',
            method: 'POST',
            context: this,
            data: {
                username: username,
                password: password
            },
            success: function(data) {
                this.user = new User(data.user.id, data.user.username, data.user.email, data.user.token);
                localStorage.setItem('billtrackerAuth', data.user.token);
                successCallback();              
            },
            error: function(error) {
                console.error('Error logging in: ', error);
                errorCallback(error);
            }
        });
    }

    logout(callback) {
        localStorage.removeItem('billtrackerAuth');
        this.user = null;
        this.notifyObservers();
        callback();
    }
}