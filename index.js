const express = require("express");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 3000;

const WEBHOOK = "https://itnasr.bitrix24.kz/rest/1/bucjza1li2wbp6lr/";

app.get("/clean-whatsapp-field", async (req, res) => {
  const invoiceId = req.query.invoice_id;
  if (!invoiceId) return res.status(400).send("❌ Нет invoice_id");

  try {
    const invoiceRes = await axios.post(`${WEBHOOK}crm.item.get`, {
      entityTypeId: 31,
      id: invoiceId,
    });

    const invoice = invoiceRes.data.result.item;
    if (!invoice) return res.status(404).send("❌ Смарт-счёт не найден");

    const currentValue = invoice.UF_CRM_SMART_INVOICE_1729361040;
    if (!currentValue) return res.send("ℹ️ Поле WhatsApp пустое");

    const cleanedValue = currentValue.replace(/\s/g, "");

    await axios.post(`${WEBHOOK}crm.item.update`, {
      entityTypeId: 31,
      id: invoiceId,
      fields: {
        UF_CRM_SMART_INVOICE_1729361040: cleanedValue,
      },
    });

    res.send(`✅ Удалены пробелы: <br>${cleanedValue}`);
  } catch (err) {
    console.error("❌ Ошибка:", err?.response?.data || err.message);
    res.status(500).send("❌ Ошибка сервера");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
