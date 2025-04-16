class TransactionView {
    constructor(containerElementId, modalContainerElementId = null) {
        this.containerElementId = containerElementId;
        this.modalContainerElementId = modalContainerElementId;
    }

    update(transaction) {   
        $(`#${this.containerElementId}`).empty(); // Clear the container

        const transactionElement = 
        `
            <div class="modal-header"> 
                <h2>${transaction.name}</h2>
            </div>
            <div class="modal-body">
                <div>Amount: ${transaction.displayAmount()}</div>
                <div>Date: ${transaction.displayDate()}</div>
                ${transaction.displayRepeats()}
            </div>
        `;

        $(`#${this.containerElementId}`).append(transactionElement);
        
        if (this.modalContainerElementId) {
            $(`#${this.modalContainerElementId}`).modal('show');
        }
    }
}