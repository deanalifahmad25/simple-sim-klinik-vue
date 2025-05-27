<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, watch } from 'vue';
import BestSellingWidget from '@/components/dashboard/BestSellingWidget.vue';
import NotificationsWidget from '@/components/dashboard/NotificationsWidget.vue';
import RecentSalesWidget from '@/components/dashboard/RecentSalesWidget.vue';
import RevenueStreamWidget from '@/components/dashboard/RevenueStreamWidget.vue';
import StatsWidget from '@/components/dashboard/StatsWidget.vue';
import { useRouter } from 'vue-router';

onMounted(() => {
    orders.value = localStorage.getItem('orders') ? JSON.parse(localStorage.getItem('orders')) : [];
    products.value = localStorage.getItem('products') ? JSON.parse(localStorage.getItem('products')) : [];
    patients.value = localStorage.getItem('patients') ? JSON.parse(localStorage.getItem('patients')) : [];
    registrations.value = localStorage.getItem('registrations') ? JSON.parse(localStorage.getItem('registrations')) : [];

    totalOrders.value = orders.value.length;
    totalRegistrations.value = registrations.value.length;
    totalPatients.value = patients.value.length;
    orders.value.forEach((element) => {
        totalCost.value = totalCost.value + element.price;
    });
});

const router = useRouter();
const toast = useToast();
const dt = ref();
const orders = ref();
const orderHistory = ref();
const products = ref();
const patients = ref();
const totalOrders = ref();
const totalRegistrations = ref();
const totalPatients = ref();
const totalCost = ref(0);
const registrations = ref();
const inputDialog = ref(false);
const inputDialogEMR = ref(false);
const inputDialogOrder = ref(false);
const deleteRegistrationDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteRegistrationsDialog = ref(false);
const registration = ref({});
const product = ref({});
const selectedRegistrations = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const filtersPatient = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const filtersProduct = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const authData = JSON.parse(localStorage.getItem('authData'));

function formatCurrency(value) {
    if (value != null) {
        return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
    }
    return '';
}

function openNew() {
    registration.value = {};
    submitted.value = false;
    inputDialog.value = true;
}

function openEMR(data) {
    registration.value = data;
    inputDialogEMR.value = true;
}

function openOrder(data) {
    submitted.value = false;
    orderHistory.value = orders.value.filter((order) => order.registrationId === data.id);
    registration.value = data;
    product.value = {};
    inputDialogOrder.value = true;
}

function formatDate(parseDate) {
    const date = new Date(parseDate);
    const [day, month, year] = date.toLocaleDateString('id-ID').split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function formatDateWithHIS(parseDate) {
    const dd = String(parseDate.getDate()).padStart(2, '0');
    const mm = String(parseDate.getMonth() + 1).padStart(2, '0');
    const yyyy = parseDate.getFullYear();
    const hh = String(parseDate.getHours()).padStart(2, '0');
    const ii = String(parseDate.getMinutes()).padStart(2, '0');
    const ss = String(parseDate.getSeconds()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd} ${hh}:${ii}:${ss}`;
}

function hideDialog() {
    inputDialog.value = false;
    submitted.value = false;
}

function hideDialogEMR() {
    inputDialogEMR.value = false;
}

function hideDialogOrder() {
    inputDialogOrder.value = false;
}

function confirmDeleteRegistration(prod) {
    registration.value = prod;
    deleteRegistrationDialog.value = true;
}

function confirmDeleteOrder(prod) {
    product.value = prod;
    deleteProductDialog.value = true;
}

function deleteOrder() {
    orders.value = orders.value.filter((val) => val.id !== product.value.id);
    localStorage.setItem('orders', JSON.stringify(orders.value));
    deleteProductDialog.value = false;
    inputDialogOrder.value = false;
    product.value = {};
    toast.add({ severity: 'success', summary: 'Sukses', detail: 'Order Dihapus', life: 3000 });
}

function deleteRegistration() {
    registrations.value = registrations.value.filter((val) => val.id !== registration.value.id);
    localStorage.setItem('registrations', JSON.stringify(registrations.value));
    deleteRegistrationDialog.value = false;
    registration.value = {};
    toast.add({ severity: 'success', summary: 'Sukses', detail: 'Data Registrasi Dihapus', life: 3000 });
}

function generateUniqueNumber(prefix) {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const randomDigits = Math.floor(100 + Math.random() * 900);

    return `${prefix}${dd}${mm}${yyyy}${randomDigits}`;
}

function saveEMR() {
    const data = registrations.value.find((data) => registration.value.id == data.id);
    data.patientWeight = registration.value.patientWeight ? registration.value.patientWeight : null;
    data.patientBloodPressure = registration.value.patientBloodPressure ? registration.value.patientBloodPressure : null;
    data.patientComplaint = registration.value.patientComplaint ? registration.value.patientComplaint : null;
    data.patientDiagnose = registration.value.patientDiagnose ? registration.value.patientDiagnose : null;

    localStorage.setItem('registrations', JSON.stringify(registrations.value));
    toast.add({ severity: 'success', summary: 'Sukses', detail: 'EMR Berhasi Diperbaharui', life: 3000 });
    inputDialogEMR.value = false;
    registration.value = {};
    return;
}

function saveRegistration(patient) {
    submitted.value = true;

    const registrationExist = registrations.value.find((data) => data.patientId == patient.id && formatDate(new Date()) == formatDate(data.registrationDate)) || null;
    if (registrationExist) {
        toast.add({ severity: 'error', summary: 'Gagal Registrasi', detail: 'Pasien Sudah Registrasi Hari Ini', life: 3000 });
        return;
    }

    registration.value.id = createId();
    registration.value.patientId = patient.id;
    registration.value.patientName = patient.name;
    registration.value.registrationNumber = generateUniqueNumber('REG');
    registration.value.registrationDate = formatDateWithHIS(new Date());
    registration.value.patientWeight = null;
    registration.value.patientBloodPressure = null;
    registration.value.patientComplaint = null;
    registration.value.patientDiagnose = null;
    registration.value.orders = [];
    registrations.value.push(registration.value);
    toast.add({ severity: 'success', summary: 'Sukses', detail: 'Data Pasien Ditambahkan', life: 3000 });
    localStorage.setItem('registrations', JSON.stringify(registrations.value));
    inputDialog.value = false;
    registration.value = {};
}

function saveOrder() {
    submitted.value = true;

    if (product.value.id) {
        product.value.name = product.value.productSelected.id;
        product.value.orderNumber = product.value.orderNumber;
        product.value.registrationId = product.value.registrationId;
        product.value.price = product.value.qty * product.value.productSelected.price;
        orders.value[findIndexById(product.value.id)] = product.value;
        toast.add({ severity: 'success', summary: 'Sukses', detail: 'Order Diupdate', life: 3000 });
    } else {
        product.value.id = createId();
        product.value.orderNumber = generateUniqueNumber('ORD');
        product.value.registrationId = registration.value.id;
        product.value.name = product.value.name;
        product.value.price = product.value.qty * product.value.productSelected.price;
        orders.value.push(product.value);
        toast.add({ severity: 'success', summary: 'Sukses', detail: 'Order Ditambahkan', life: 3000 });
    }

    localStorage.setItem('orders', JSON.stringify(orders.value));
    inputDialogOrder.value = false;
    registration.value = {};
    product.value = {};
}

function findIndexById(id) {
    let index = -1;
    for (let i = 0; i < registrations.value.length; i++) {
        if (registrations.value[i].id === id) {
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

function openDetail(data) {
    router.push({ name: 'detail', query: { registration: data.registrationNumber } });
}

function exportCSV() {
    dt.value.exportCSV();
}

function confirmDeleteSelected() {
    deleteRegistrationsDialog.value = true;
}

function deleteSelectedRegistrations() {
    registrations.value = registrations.value.filter((val) => !selectedRegistrations.value.includes(val));
    localStorage.setItem('registrations', JSON.stringify(registrations.value));
    deleteRegistrationsDialog.value = false;
    selectedRegistrations.value = null;
    toast.add({ severity: 'success', summary: 'Sukses', detail: 'Data Registrasi Dihapus', life: 3000 });
}

watch(
    [() => orders.value, () => registrations.value, () => patients.value],
    ([newOrders, newRegistrations, newPatients]) => {
        if (!Array.isArray(newOrders)) newOrders = [];
        if (!Array.isArray(newRegistrations)) newRegistrations = [];
        if (!Array.isArray(newPatients)) newPatients = [];

        totalOrders.value = newOrders.length;
        totalRegistrations.value = newRegistrations.length;
        totalPatients.value = newPatients.length;
        totalCost.value = newOrders.reduce((sum, order) => sum + (order.price || 0), 0);
    },
    { immediate: true, deep: true }
);
</script>

<template>
    <div class="grid grid-cols-12 gap-8">
        <StatsWidget :orders="totalOrders" :registrations="totalRegistrations" :cost="formatCurrency(totalCost)" :patients="totalPatients" />
    </div>

    <div class="mt-8">
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button v-if="authData.user.role == 'pendaftaran'" label="Tambah" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                    <Button v-if="authData.user.role == 'pendaftaran'" label="Hapus" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected" :disabled="!selectedRegistrations || !selectedRegistrations.length" />
                </template>

                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                v-model:selection="selectedRegistrations"
                :value="registrations"
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
                        <h4 class="m-0">Daftar Registrasi</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Search..." />
                        </IconField>
                    </div>
                </template>

                <Column v-if="authData.user.role == 'pendaftaran'" selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="registrationNumber" header="Noregistrasi" sortable style="min-width: 16rem"></Column>
                <Column field="patientName" header="Nama Pasien" sortable style="min-width: 16rem"></Column>
                <Column field="registrationDate" header="Tanggal Registrasi" sortable style="min-width: 16rem"></Column>
                <Column field="patientWeight" header="Berat Badan" sortable style="min-width: 16rem">
                    <template #body="slotProps">
                        {{ slotProps.data.patientWeight ? slotProps.data.patientWeight : '-' }}
                    </template>
                </Column>
                <Column field="patientBloodPressure" header="Tekanan Darah" sortable style="min-width: 16rem">
                    <template #body="slotProps">
                        {{ slotProps.data.patientBloodPressure ? slotProps.data.patientBloodPressure : '-' }}
                    </template>
                </Column>
                <Column field="patientComplaint" header="Keluhan" sortable style="min-width: 16rem">
                    <template #body="slotProps">
                        {{ slotProps.data.patientComplaint ? slotProps.data.patientComplaint : '-' }}
                    </template>
                </Column>
                <Column field="patientDiagnose" header="Hasil Diagnosa" sortable style="min-width: 16rem">
                    <template #body="slotProps">
                        {{ slotProps.data.patientDiagnose ? slotProps.data.patientDiagnose : '-' }}
                    </template>
                </Column>
                <Column :exportable="false" header="Aksi" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button v-tooltip="'Detail'" class="mr-2" icon="pi pi-search" outlined rounded severity="info" @click="openDetail(slotProps.data)" />
                        <Button v-if="authData.user.role == 'pendaftaran'" v-tooltip="'Hapus'" class="mr-2" icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteRegistration(slotProps.data)" />
                        <Button v-if="authData.user.role == 'perawat' || authData.user.role == 'dokter'" v-tooltip="'EMR'" icon="pi pi-fw pi-check-square" outlined rounded severity="success" @click="openEMR(slotProps.data)" />
                        <Button v-if="authData.user.role == 'apoteker'" v-tooltip="'Order Obat'" class="mr-2" icon="pi pi-shopping-cart" outlined rounded @click="openOrder(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>

    <Dialog v-model:visible="inputDialog" :style="{ width: '850px' }" header="Data Pasien" :modal="true">
        <div class="card">
            <DataTable
                :value="patients"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} patients"
                :filters="filtersPatient"
                responsiveLayout="scroll"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filtersPatient['global'].value" placeholder="Search..." />
                        </IconField>
                    </div>
                </template>

                <Column field="name" header="Name" :sortable="true" style="min-width: 16rem"></Column>
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
                <Column style="min-width: 10rem" header="Aksi">
                    <template #body="slotProps">
                        <Button label="Registrasi" @click="saveRegistration(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <template #footer>
            <Button label="Batal" icon="pi pi-times" severity="danger" text @click="hideDialog" />
        </template>
    </Dialog>

    <Dialog v-model:visible="inputDialogOrder" :style="{ width: '850px' }" header="Order Produk" :modal="true">
        <div class="card mb-4">
            <div class="font-semibold text-xl mb-4">Riwayat Order</div>
            <DataTable :value="orderHistory" :rows="5" :paginator="true" responsiveLayout="scroll">
                <Column field="name" header="Produk" :sortable="true" style="min-width: 16rem">
                    <template #body="slotProps">
                        {{ slotProps.data.productSelected.name }}
                    </template>
                </Column>
                <Column field="price" header="Harga" :sortable="true" style="min-width: 16rem">
                    <template #body="slotProps">
                        {{ formatCurrency(slotProps.data.productSelected.price) }}
                    </template>
                </Column>
                <Column field="qty" header="Jumlah" :sortable="true" style="min-width: 16rem">
                    <template #body="slotProps">
                        {{ slotProps.data.qty }}
                    </template>
                </Column>
                <Column field="price" header="Total" :sortable="true" style="min-width: 16rem">
                    <template #body="slotProps">
                        {{ formatCurrency(slotProps.data.price) }}
                    </template>
                </Column>
                <Column style="width: 15%" header="Aksi">
                    <template #body="slotProps">
                        <Button v-if="authData.user.role == 'apoteker'" v-tooltip="'Hapus'" class="mr-2" icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteOrder(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <div class="flex flex-col gap-6">
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-6">
                    <label for="productSelected" class="block font-bold mb-3">Produk</label>
                    <Dropdown id="productSelected" v-model="product.productSelected" :options="products" optionLabel="name" placeholder="Pilih produk" :filter="true" required fluid>
                        <template #option="slotProps"> {{ slotProps.option.name }} - Rp{{ slotProps.option.price.toLocaleString('id-ID') }} </template>
                    </Dropdown>
                    <small v-if="submitted && !product.productSelected" class="text-red-500">Produk Harus Di isi.</small>
                </div>

                <div class="col-span-6">
                    <label for="qty" class="block font-bold mb-3">Jumlah</label>
                    <InputNumber id="qty" v-model="product.qty" integeronly fluid required />
                    <small v-if="submitted && !product.qty" class="text-red-500">Jumlah Harus Di isi.</small>
                </div>
            </div>
        </div>

        <template #footer>
            <Button label="Batal" icon="pi pi-times" severity="danger" text @click="hideDialogOrder" />
            <Button label="Order" icon="pi pi-shopping-cart" severity="info" @click="saveOrder" />
        </template>
    </Dialog>

    <Dialog v-model:visible="inputDialogEMR" :style="{ width: '850px' }" header="EMR Pasien" :modal="true">
        <div class="flex flex-col gap-6">
            <div v-if="authData.user.role == 'perawat'" class="grid grid-cols-12 gap-4">
                <div class="col-span-6">
                    <label for="patientWeight" class="block font-bold mb-3">Berat Badan</label>
                    <InputText id="patientWeight" v-model="registration.patientWeight" keyfilter="pint" fluid />
                </div>

                <div class="col-span-6">
                    <label for="patientBloodPressure" class="block font-bold mb-3">Tekanan Darah</label>
                    <InputText id="patientBloodPressure" v-model="registration.patientBloodPressure" keyfilter="pint" fluid />
                </div>
            </div>

            <div v-else-if="authData.user.role == 'dokter'">
                <div class="mb-4">
                    <label for="patientComplaint" class="block font-bold mb-3">Keluhan Pasien</label>
                    <Textarea id="patientComplaint" v-model="registration.patientComplaint" required="true" rows="3" cols="20" fluid />
                </div>

                <div>
                    <label for="patientDiagnose" class="block font-bold mb-3">Hasil Diagnosa</label>
                    <Textarea id="patientDiagnose" v-model="registration.patientDiagnose" required="true" rows="3" cols="20" fluid />
                </div>
            </div>
        </div>

        <template #footer>
            <Button label="Batal" icon="pi pi-times" severity="danger" text @click="hideDialogEMR" />
            <Button label="Simpan" icon="pi pi-check" @click="saveEMR" />
        </template>
    </Dialog>

    <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Konfirmasi" :modal="true">
        <div class="flex items-center gap-4">
            <i class="pi pi-exclamation-triangle !text-3xl" />
            <span v-if="product"
                >Apakah Anda yakin ingin menghapus order pasien <b>{{ product.productSelected.name }} ({{ product.orderNumber }})</b>?</span
            >
        </div>
        <template #footer>
            <Button label="Batal" severity="contrast" icon="pi pi-times" text @click="deleteProductDialog = false" />
            <Button label="Hapus" severity="danger" icon="pi pi-check" @click="deleteOrder" />
        </template>
    </Dialog>

    <Dialog v-model:visible="deleteRegistrationDialog" :style="{ width: '450px' }" header="Konfirmasi" :modal="true">
        <div class="flex items-center gap-4">
            <i class="pi pi-exclamation-triangle !text-3xl" />
            <span v-if="registration"
                >Apakah Anda yakin ingin menghapus registrasi pasien <b>{{ registration.patientName }} ({{ registration.registrationNumber }})</b>?</span
            >
        </div>
        <template #footer>
            <Button label="Batal" severity="contrast" icon="pi pi-times" text @click="deleteRegistrationDialog = false" />
            <Button label="Hapus" severity="danger" icon="pi pi-check" @click="deleteRegistration" />
        </template>
    </Dialog>

    <Dialog v-model:visible="deleteRegistrationsDialog" :style="{ width: '450px' }" header="Konfirmasi" :modal="true">
        <div class="flex items-center gap-4">
            <i class="pi pi-exclamation-triangle !text-3xl" />
            <span v-if="registration">Apakah Anda yakin ingin menghapus?</span>
        </div>
        <template #footer>
            <Button label="Batal" severity="contrast" icon="pi pi-times" text @click="deleteRegistrationsDialog = false" />
            <Button label="Hapus" severity="danger" icon="pi pi-check" @click="deleteSelectedRegistrations" />
        </template>
    </Dialog>
</template>
