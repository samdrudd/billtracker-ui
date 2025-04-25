class TransactionListView {
    constructor(containerElementId) {
        this.containerElementId = containerElementId;
    }

    renderTransactionList(transactions) {   
        $(`#${this.containerElementId}`).empty(); // Clear the container

        transactions.forEach(transaction => {
            const transactionElement = 
            `
                <div class="transaction ${transaction.type}" id="${transaction.id}" data-repeats="${transaction.repeats}" data-repeats-on="${transaction.repeatsOn}" data-date="${transaction.date}" onClick="selectTransaction('${transaction.id}')">
                    <div class="transaction-name"><span onClick="deleteTransaction('${transaction.id}')"><i class="fa fa-circle-minus text-danger align-middle action-button"></i></span> ${transaction.name}</div>
                    <div class="transaction-details">
                        <div class="transaction-date">${transaction.displayDate()}</div>
                        <div class="transaction-amount">${transaction.displayAmount()}</div>
                    </div>
                </div>
            `;
            $(`#${this.containerElementId}`).append(transactionElement);
        });
    }

    update(transactions) {
        this.renderTransactionList(transactions);
    }
}