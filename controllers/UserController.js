class UserController {
    constructor(model) {
        this.model = model;
    }

    isLoggedIn() {
        return this.model.user !== null;
    }

    tokenAuth(successCallback, errorCallback) {
        this.model.tokenAuth( 
            () => {
                console.log('Token authentication successful');
                successCallback();
            },
            () => {
                console.error('Token authentication failed');
                localStorage.removeItem('billtrackerAuth');
                errorCallback();
            }
        );
    }

    login(username, password, successCallback, errorCallback) {
        this.model.login(username, password, 
            (data) => {
                console.log('Login successful: ', data);
                successCallback();
            },
            (error) => {
                console.error('Login failed: ', error);
                errorCallback();
            }
        );
    }
}