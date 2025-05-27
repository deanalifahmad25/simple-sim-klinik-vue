<script setup>
import { onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const products = ref(null);
const product = ref({});
const inputDialog = ref(false);
const deleteProductDialog = ref(false);
const submitted = ref(false);
const options = ref(['list', 'grid']);
const layout = ref('list');

onMounted(() => {
    products.value = localStorage.getItem('products') ? JSON.parse(localStorage.getItem('products')) : [];
});

function formatCurrency(value) {
    if (value != null) {
        return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
    }
    return '';
}

function openNew() {
    product.value = {};
    submitted.value = false;
    inputDialog.value = true;
}

function hideDialog() {
    inputDialog.value = false;
    submitted.value = false;
}

function saveProduct() {
    submitted.value = true;

    if (product?.value.name?.trim()) {
        if (product.value.id) {
            product.value.name = product.value.name;
            product.value.price = product.value.price;
            product.value.description = product.value.description ? product.value.description : null;
            products.value[findIndexById(product.value.id)] = product.value;
            toast.add({ severity: 'success', summary: 'Sukses', detail: 'Data Produk Diupdate', life: 3000 });
        } else {
            product.value.id = createId();
            product.value.name = product.value.name;
            product.value.price = product.value.price;
            product.value.description = product.value.description ? product.value.description : null;
            products.value.push(product.value);
            toast.add({ severity: 'success', summary: 'Sukses', detail: 'Data Produk Ditambahkan', life: 3000 });
        }

        localStorage.setItem('products', JSON.stringify(products.value));
        inputDialog.value = false;
        product.value = {};
    }
}

function editProduct(prod) {
    product.value = { ...prod };
    inputDialog.value = true;
}

function confirmDeleteProduct(prod) {
    product.value = prod;
    deleteProductDialog.value = true;
}

function findIndexById(id) {
    let index = -1;
    for (let i = 0; i < products.value.length; i++) {
        if (products.value[i].id === id) {
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

function deleteProduct() {
    products.value = products.value.filter((val) => val.id !== product.value.id);
    localStorage.setItem('products', JSON.stringify(products.value));
    deleteProductDialog.value = false;
    product.value = {};
    toast.add({ severity: 'success', summary: 'Sukses', detail: 'Data Pasien Dihapus', life: 3000 });
}
</script>

<template>
    <div class="flex flex-col">
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Tambah" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                </template>
            </Toolbar>

            <div class="font-semibold text-xl">Master Produk</div>
            <DataView :value="products" :layout="layout">
                <template #header>
                    <div class="flex justify-end">
                        <SelectButton v-model="layout" :options="options" :allowEmpty="false">
                            <template #option="{ option }">
                                <i :class="[option === 'list' ? 'pi pi-bars' : 'pi pi-table']" />
                            </template>
                        </SelectButton>
                    </div>
                </template>

                <template #list="slotProps">
                    <div class="flex flex-col">
                        <div v-for="(item, index) in slotProps.items" :key="index">
                            <div class="flex flex-col sm:flex-row sm:items-center p-6 gap-4" :class="{ 'border-t border-surface': index !== 0 }">
                                <div class="md:w-40 relative">
                                    <img class="block xl:block mx-auto rounded w-full" :src="`/demo/images/logo.svg`" :alt="item.name" />
                                </div>
                                <div class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-6">
                                    <div class="flex flex-row md:flex-col justify-between items-start gap-2">
                                        <div>
                                            <div class="text-lg font-medium mt-2">{{ item.name }}</div>
                                            <span class="font-medium text-surface-500 dark:text-surface-400 text-sm">{{ item.description }}</span>
                                        </div>
                                    </div>
                                    <div class="flex flex-col md:items-end gap-8">
                                        <span class="text-xl font-semibold">{{ formatCurrency(item.price) }}</span>
                                        <div class="flex flex-row-reverse md:flex-row gap-2">
                                            <Button icon="pi pi-pencil" label="Edit" severity="warn" @click="editProduct(item)" class="flex-auto md:flex-initial whitespace-nowrap"></Button>
                                            <Button icon="pi pi-trash" label="Hapus" severity="danger" @click="confirmDeleteProduct(item)" class="flex-auto md:flex-initial whitespace-nowrap"></Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>

                <template #grid="slotProps">
                    <div class="grid grid-cols-12 gap-4">
                        <div v-for="(item, index) in slotProps.items" :key="index" class="col-span-12 sm:col-span-6 lg:col-span-4 p-2">
                            <div class="p-6 border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 rounded flex flex-col">
                                <div class="bg-surface-50 flex justify-center rounded p-4">
                                    <div class="relative mx-auto">
                                        <img class="rounded w-full" :src="`/demo/images/logo.svg`" :alt="item.name" style="max-width: 300px" />
                                    </div>
                                </div>
                                <div class="pt-6">
                                    <div class="flex flex-row justify-between items-start gap-2">
                                        <div>
                                            <div class="text-lg font-medium mt-1">{{ item.name }}</div>
                                            <span class="font-medium text-surface-500 dark:text-surface-400 text-sm">{{ item.description }}</span>
                                        </div>
                                    </div>
                                    <div class="flex flex-col gap-6 mt-6">
                                        <span class="text-2xl font-semibold">{{ formatCurrency(item.price) }}</span>
                                        <div class="flex gap-2">
                                            <Button icon="pi pi-pencil" label="Edit" severity="warn" class="flex-auto whitespace-nowrap"></Button>
                                            <Button icon="pi pi-trash" label="Hapus" severity="danger" class="flex-auto whitespace-nowrap"></Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </DataView>
        </div>
    </div>

    <Dialog v-model:visible="inputDialog" :style="{ width: '850px' }" header="Tambah Produk" :modal="true">
        <div class="flex flex-col gap-6">
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-6">
                    <label for="name" class="block font-bold mb-3">Nama Produk</label>
                    <InputText id="name" v-model.trim="product.name" required="true" autofocus :invalid="submitted && !product.name" fluid />
                    <small v-if="submitted && !product.name" class="text-red-500">Nama Produk Harus Di isi.</small>
                </div>

                <div class="col-span-6">
                    <label for="price" class="block font-bold mb-3">Harga</label>
                    <InputNumber id="price" v-model="product.price" integeronly fluid required />
                    <small v-if="submitted && !product.price" class="text-red-500">Harga Harus Di isi.</small>
                </div>
            </div>
            <div>
                <label for="description" class="block font-bold mb-3">Deskripsi</label>
                <Textarea id="description" v-model="product.description" required="true" rows="3" cols="20" fluid />
            </div>
        </div>

        <template #footer>
            <Button label="Batal" icon="pi pi-times" text @click="hideDialog" />
            <Button label="Simpan" icon="pi pi-check" @click="saveProduct" />
        </template>
    </Dialog>

    <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Konfirmasi" :modal="true">
        <div class="flex items-center gap-4">
            <i class="pi pi-exclamation-triangle !text-3xl" />
            <span v-if="product"
                >Apakah Anda yakin ingin menghapus <b>{{ product.name }}</b
                >?</span
            >
        </div>
        <template #footer>
            <Button label="Batal" severity="contrast" icon="pi pi-times" text @click="deleteProductDialog = false" />
            <Button label="Hapus" severity="danger" icon="pi pi-check" @click="deleteProduct" />
        </template>
    </Dialog>
</template>
