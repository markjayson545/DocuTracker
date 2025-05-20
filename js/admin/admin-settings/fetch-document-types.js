document.addEventListener('DOMContentLoaded', function () {
    const docTypesListBody = document.getElementById('doc-types-list-body');
    const documentFormModal = document.getElementById('document-modal');
    const documentForm = document.getElementById('document-add-edit');
    const addDocTypeBtn = document.getElementById('add-doc-type-btn');
    const saveDocTypeBtn = document.getElementById('save-doc-type');
    const deleteDocTypeBtn = document.getElementById('delete-doc-type-btn');
    const modalCloseBtn = document.querySelector('.modal-close');
    const modalCloseBtnFooter = document.querySelector('.modal-close-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalSaveBtnText = document.getElementById('modal-save-btn-text');
    const modalDocName = document.getElementById('modal-doc-name');
    const modalDocPrice = document.getElementById('modal-doc-price');
    const modalDocId = document.getElementById('modal-doc-id');
    const modalAction = document.getElementById('modal-action');

    // Add event listeners
    addDocTypeBtn.addEventListener('click', openAddDocumentTypeModal);
    documentForm.addEventListener('submit', handleFormSubmit);
    deleteDocTypeBtn.addEventListener('click', deleteDocumentType);
    modalCloseBtn.addEventListener('click', closeModal);
    modalCloseBtnFooter.addEventListener('click', closeModal);

    function openAddDocumentTypeModal() {
        // Reset form
        documentForm.reset();
        
        // Set modal for add mode
        modalTitle.textContent = 'Add Document Type';
        modalSaveBtnText.textContent = 'Add';
        modalAction.value = 'add';
        modalDocId.value = '';
        
        // Hide delete button for add mode
        deleteDocTypeBtn.style.display = 'none';
        
        // Show the modal
        documentFormModal.style.display = 'block';
        documentFormModal.classList.add('show');
    }

    function openEditDocumentTypeModal(documentTypeId, documentType, price) {
        // Set form values
        modalDocName.value = documentType;
        modalDocPrice.value = price;
        modalDocId.value = documentTypeId;
        
        // Set modal for edit mode
        modalTitle.textContent = 'Edit Document Type';
        modalSaveBtnText.textContent = 'Update';
        modalAction.value = 'edit';
        
        // Show delete button for edit mode
        deleteDocTypeBtn.style.display = 'inline-block';
        
        // Show the modal
        documentFormModal.style.display = 'block';
        documentFormModal.classList.add('show');
    }

    function closeModal(e) {
        e.preventDefault();
        documentFormModal.style.display = 'none';
        documentFormModal.classList.remove('show');
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        if (modalAction.value === 'add') {
            addDocumentType();
        } else {
            updateDocumentType();
        }
    }

    function addDocumentType() {
        const formData = new FormData(document.getElementById('document-add-edit'));
        formData.append('action', 'addDocumentType');
        formData.append('document_type', modalDocName.value);
        formData.append('price', modalDocPrice.value);
        
        fetch('php/admin/admin-settings/handle-document-types.php', {
            method: 'POST',
            body: formData
        }).then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.status) {
                    documentFormModal.style.display = 'none';
                    documentFormModal.classList.remove('show');
                    documentForm.reset();
                    fetchDocumentTypes();
                } else {
                    console.error('Error adding document type:', data.message);
                }
            });
    }

    function updateDocumentType() {
        const formData = new FormData();
        formData.append('action', 'updateDocumentType');
        formData.append('document_type_id', modalDocId.value);
        formData.append('document_type', modalDocName.value);
        formData.append('price', modalDocPrice.value);
        
        fetch('php/admin/admin-settings/handle-document-types.php', {
            method: 'POST',
            body: formData
        }).then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.status) {
                    documentFormModal.style.display = 'none';
                    documentFormModal.classList.remove('show');
                    documentForm.reset();
                    fetchDocumentTypes();
                } else {
                    console.error('Error updating document type:', data.message);
                }
            });
    }

    function deleteDocumentType(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to delete this document type?')) {
            const formData = new FormData();
            formData.append('action', 'deleteDocumentType');
            formData.append('document_type_id', modalDocId.value);
            
            fetch('php/admin/admin-settings/handle-document-types.php', {
                method: 'POST',
                body: formData
            }).then(response => response.json())
                .then(data => {
                    console.log(data);
                    if (data.status) {
                        documentFormModal.style.display = 'none';
                        documentFormModal.classList.remove('show');
                        documentForm.reset();
                        fetchDocumentTypes();
                    } else {
                        console.error('Error deleting document type:', data.message);
                    }
                });
        }
    }

    function fetchDocumentTypes() {
        docTypesListBody.innerHTML = ''; // Clear the list before fetching

        const formData = new FormData();
        formData.append('action', 'getAllDocumentTypes');

        fetch('php/admin/admin-settings/handle-document-types.php', {
            method: 'POST',
            body: formData
        }).then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.status) {
                    const docTypes = data.document_types;
                    docTypes.forEach(element => {
                        const rowTemplate = `
                                    <tr>
                                        <td>${element.document_type}</td>
                                        <td>₱${element.price}</td>
                                        <td>
                                            <div class="doc-actions">
                                                <button title="Edit Document" class="edit-doc-btn" data-id="${element.document_type_id}" data-name="${element.document_type}" data-price="${element.price}">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                        `;
                        docTypesListBody.insertAdjacentHTML('beforeend', rowTemplate);
                    });
                    
                    // Add event listeners to edit buttons
                    document.querySelectorAll('.edit-doc-btn').forEach(button => {
                        button.addEventListener('click', function() {
                            const id = this.getAttribute('data-id');
                            const name = this.getAttribute('data-name');
                            const price = this.getAttribute('data-price');
                            openEditDocumentTypeModal(id, name, price);
                        });
                    });
                } else {
                    console.error('Error fetching document types:', data.message);
                }
            });
    }

    fetchDocumentTypes();
    setInterval(fetchDocumentTypes, 60000);
});