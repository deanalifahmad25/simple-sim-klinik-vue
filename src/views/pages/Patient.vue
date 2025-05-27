<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

onMounted(() => {
    patients.value = localStorage.getItem('patients') ? JSON.parse(localStorage.getItem('patients')) : [];
});

const toast = useToast();
const dt = ref();
const patients = ref();
const inputDialog = ref(false);
const deletePatientDialog = ref(false);
const deletePatientsDialog = ref(false);
const patient = ref({});
const selectedPatients = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const statuses = ref([
    { label: 'Laki-Laki', value: 'male' },
    { label: 'Perempuan', value: 'female' }
]);

function formatCurrency(value) {
    if (value) return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    return;
}

function openNew() {
    patient.value = {};
    submitted.value = false;
    inputDialog.value = true;
}

function formatDate(parseDate) {
    const date = new Date(parseDate);
    const [day, month, year] = date.toLocaleDateString('id-ID').split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function hideDialog() {
    inputDialog.value = false;
    submitted.value = false;
}

function savePatient() {
    submitted.value = true;

    if (patient?.value.name?.trim()) {
        if (patient.value.id) {
            patient.value.name = patient.value.name;
            patient.value.gender = patient.value.gender.value ? patient.value.gender.value : patient.value.gender;
            patient.value.birthDate = formatDate(patient.value.birthDate);
            patient.value.phoneNumber = patient.value.phoneNumber;
            patients.value[findIndexById(patient.value.id)] = patient.value;
            toast.add({ severity: 'success', summary: 'Sukses', detail: 'Data Pasien Diupdate', life: 3000 });
        } else {
            patient.value.id = createId();
            patient.value.name = patient.value.name;
            patient.value.gender = patient.value.gender ? patient.value.gender.value : null;
            patient.value.birthDate = formatDate(patient.value.birthDate);
            patient.value.phoneNumber = patient.value.phoneNumber;
            patients.value.push(patient.value);
            toast.add({ severity: 'success', summary: 'Sukses', detail: 'Data Pasien Ditambahkan', life: 3000 });
        }

        localStorage.setItem('patients', JSON.stringify(patients.value));
        inputDialog.value = false;
        patient.value = {};
    }
}

function editPatient(prod) {
    patient.value = { ...prod };
    patient.value.gender = statuses.value.find((gender) => gender.value == patient.value.gender);
    inputDialog.value = true;
}

function confirmDeletePatient(prod) {
    patient.value = prod;
    deletePatientDialog.value = true;
}

function deleteProduct() {
    patients.value = patients.value.filter((val) => val.id !== patient.value.id);
    localStorage.setItem('patients', JSON.stringify(patients.value));
    deletePatientDialog.value = false;
    patient.value = {};
    toast.add({ severity: 'success', summary: 'Sukses', detail: 'Data Pasien Dihapus', life: 3000 });
}

function findIndexById(id) {
    let index = -1;
    for (let i = 0; i < patients.value.length; i++) {
        if (patients.value[i].id === id) {
            index = i;
            break;
        }
    }

    return index;
}

function createId() {
    let id = '';
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 5; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

function exportCSV() {
    dt.value.exportCSV();
}

function confirmDeleteSelected() {
    deletePatientsDialog.value = true;
}

function deleteSelectedPatients() {
    patients.value = patients.value.filter((val) => !selectedPatients.value.includes(val));
    localStorage.setItem('patients', JSON.stringify(patients.value));
    deletePatientsDialog.value = false;
    selectedPatients.value = null;
    toast.add({ severity: 'success', summary: 'Sukses', detail: 'Data Pasien Dihapus', life: 3000 });
}
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Tambah" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                    <Button label="Hapus" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected" :disabled="!selectedPatients || !selectedPatients.length" />
                </template>

                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                v-model:selection="selectedPatients"
                :value="patients"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} patients"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Daftar Pasien</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Search..." />
                        </IconField>
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="name" header="Nama Pasien" sortable style="min-width: 16rem"></Column>
                <Column field="birthDate" header="Tanggal Lahir" sortable style="min-width: 16rem">
                    <template #body="slotProps">
                        {{ formatDate(slotProps.data.birthDate) }}
                    </template>
                </Column>
                <Column field="gender" header="Jenis Kelamin" sortable style="min-width: 16rem">
                    <template #body="slotProps">
                        {{ slotProps.data.gender == 'male' ? 'Laki-laki' : 'Perempuan' }}
                    </template>
                </Column>
                <Column field="phoneNumber" header="No Handphone" sortable style="min-width: 16rem"></Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editPatient(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeletePatient(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="inputDialog" :style="{ width: '450px' }" header="Data Pasien" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="name" class="block font-bold mb-3">Nama Pasien</label>
                    <InputText id="name" v-model.trim="patient.name" required="true" autofocus :invalid="submitted && !patient.name" fluid />
                    <small v-if="submitted && !patient.name" class="text-red-500">Nama Pasien Harus Di isi.</small>
                </div>
                <div>
                    <label for="description" class="block font-bold mb-3">Tanggal Lahir</label>
                    <DatePicker :showIcon="true" :showButtonBar="true" v-model="patient.birthDate" fluid required="true"></DatePicker>
                    <small v-if="submitted && !patient.birthDate" class="text-red-500">Tanggal Lahir Harus Di isi.</small>
                </div>
                <div>
                    <label for="gender" class="block font-bold mb-3">Jenis Kelamin</label>
                    <Select id="gender" v-model="patient.gender" :options="statuses" optionLabel="label" placeholder="Pilih" fluid required="true"></Select>
                    <small v-if="submitted && !patient.gender" class="text-red-500">Jenis Kelamin Harus Di isi.</small>
                </div>
                <div>
                    <label for="phoneNumber" class="block font-bold mb-3">No Hanphone</label>
                    <InputText id="phoneNumber" v-model="patient.phoneNumber" keyfilter="pint" placeholder="08xxxxxxxxxx" maxlength="15" fluid />
                </div>
            </div>

            <template #footer>
                <Button label="Batal" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Simpan" icon="pi pi-check" @click="savePatient" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deletePatientDialog" :style="{ width: '450px' }" header="Konfirmasi" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="patient"
                    >Apakah Anda yakin ingin menghapus <b>{{ patient.name }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="Batal" severity="contrast" icon="pi pi-times" text @click="deletePatientDialog = false" />
                <Button label="Hapus" severity="danger" icon="pi pi-check" @click="deleteProduct" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deletePatientsDialog" :style="{ width: '450px' }" header="Konfirmasi" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="patient">Apakah Anda yakin ingin menghapus?</span>
            </div>
            <template #footer>
                <Button label="Batal" severity="contrast" icon="pi pi-times" text @click="deletePatientsDialog = false" />
                <Button label="Hapus" severity="danger" icon="pi pi-check" @click="deleteSelectedPatients" />
            </template>
        </Dialog>
    </div>
</template>
