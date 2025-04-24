class UserController {
    constructor(model) {
        this.model = model;
    }

    isLoggedIn() {
        return this.model.user !== null;
    }

    create(username, email, password) {
        this.model.create(username, email, password, 
            () => {
                window.location.href = 'login.html?r=s&a=create';
            },
            (errors) => {
                let errorString = errors.join(',');
                window.location.href = 'register.html?r=e&c=' + errorString + '&u=' + username + '&e=' + email;
            }
        );
    }

    tokenAuth(successCallback, errorCallback) {
        this.model.tokenAuth( 
            () => {
                successCallback();
            },
            () => {
                localStorage.removeItem('billtrackerAuth');
                errorCallback();
            }
        );
    }

    login(username, password) {
        this.model.login(username, password, 
            (data) => {
                window.location.href = 'index.html';
            },
            (errors) => {
                let errorString = errors.join(',');
                window.location.href = 'login.html?r=e&c=' + errorString;
            }
        );
    }

    logout() {
        this.model.logout(() => {
            window.location.href = 'login.html?r=s&a=logout';
        });
    }
}