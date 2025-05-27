<script setup>
import { useRoute } from 'vue-router';
import { onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { computed } from 'vue';

const route = useRoute();
const toast = useToast();
const registrationNumber = route.query.registration;
const datas = ref();

onMounted(() => {
    const registration = JSON.parse(localStorage.getItem('registrations')).find((data) => registrationNumber == data.registrationNumber);
    const orders = JSON.parse(localStorage.getItem('orders')) ? JSON.parse(localStorage.getItem('orders')).filter((data) => data.registrationId == registration.id) : [];
    const patient = JSON.parse(localStorage.getItem('patients')).find((data) => data.id == registration.patientId);
    datas.value = { registration, orders, patient };
    console.log(datas.value);
});

function formatCurrency(value) {
    if (value != null) {
        return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
    }
    return '';
}

const getTotalPrice = computed(() => {
    if (!datas.value || !Array.isArray(datas.value.orders)) return 0;

    return datas.value.orders.reduce((sum, item) => sum + (item.price || 0), 0);
});
</script>

<template>
    <div class="flex mt-8">
        <div class="card flex flex-col gap-4 w-full">
            <div class="font-semibold text-xl border-t pt-4">Biodata Pasien</div>

            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-6">
                    <label for="patientName" class="block font-bold mb-3">Nama Pasien</label>
                    <InputText id="patientName" :modelValue="datas ? datas.patient.name : ''" disabled fluid />
                </div>

                <div class="col-span-6">
                    <label for="birthDate" class="block font-bold mb-3">Tanggal Lahir</label>
                    <InputText id="birthDate" :modelValue="datas ? datas.patient.birthDate : ''" disabled fluid />
                </div>
            </div>

            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-6">
                    <label for="patientGender" class="block font-bold mb-3">Jenis Kelamin</label>
                    <InputText id="patientGender" :modelValue="datas ? (datas.patient.gender == 'male' ? 'Laki-laki' : 'Perempuan') : ''" disabled fluid />
                </div>

                <div class="col-span-6">
                    <label for="patientPhoneNumber" class="block font-bold mb-3">No Handphone</label>
                    <InputText id="patientPhoneNumber" :modelValue="datas ? datas.patient.phoneNumber : ''" disabled fluid />
                </div>
            </div>

            <div class="font-semibold text-xl mt-4 border-t pt-4">Data Registrasi Pasien</div>

            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-6">
                    <label for="registrationNumber" class="block font-bold mb-3">No Registrasi</label>
                    <InputText id="registrationNumber" :modelValue="datas ? datas.registration.registrationNumber : ''" disabled fluid />
                </div>

                <div class="col-span-6">
                    <label for="registrationDate" class="block font-bold mb-3">Tanggal Registrasi</label>
                    <InputText id="registrationDate" :modelValue="datas ? datas.registration.registrationDate : ''" disabled fluid />
                </div>
            </div>

            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-6">
                    <label for="patientWeight" class="block font-bold mb-3">Berat Badan</label>
                    <InputText id="patientWeight" :modelValue="datas ? datas.registration.patientWeight : ''" disabled fluid />
                </div>

                <div class="col-span-6">
                    <label for="patientBloodPressure" class="block font-bold mb-3">Tekanan Darah</label>
                    <InputText id="patientBloodPressure" :modelValue="datas ? datas.registration.patientBloodPressure : ''" disabled fluid />
                </div>
            </div>

            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12">
                    <label for="patientComplaint" class="block font-bold mb-3">Keluhan Pasien</label>
                    <Textarea id="patientComplaint" :modelValue="datas ? datas.registration.patientComplaint : ''" disabled rows="3" cols="20" fluid />
                </div>

                <div class="col-span-12">
                    <label for="patientDiagnose" class="block font-bold mb-3">Hasil Diagnosa</label>
                    <Textarea id="patientDiagnose" :modelValue="datas ? datas.registration.patientDiagnose : ''" disabled rows="3" cols="20" fluid />
                </div>
            </div>

            <div class="font-semibold text-xl mt-4 border-t pt-4">Riwayat Order Pasien</div>

            <div>
                <DataTable :value="datas ? datas.orders : []" :rows="5" :paginator="true" responsiveLayout="scroll">
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

                        <template #footer>
                            <strong>{{ formatCurrency(getTotalPrice) }}</strong>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>
