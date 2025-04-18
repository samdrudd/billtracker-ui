class UserHeaderView {
    constructor(containerElementId) {
        this.containerElementId = containerElementId;
    }

    update(user) {   
        $(`#${this.containerElementId}`).text(''); // Clear the container

        if (!user) 
            return;

        $(`#${this.containerElementId}`).text(`${user.username}`);
    }
}