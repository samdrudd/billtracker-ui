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
                successCallback();
            },
            error: function(error) {
                console.error('Error authenticating with token: ', error);
                localStorage.removeItem('billtrackerAuth');
                this.user = null;
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
}