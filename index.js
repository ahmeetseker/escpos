const escpos = require("escpos");
escpos.Network = require("escpos-network");
const path = require("path");

const networkDevice = new escpos.Network("192.168.2.84", 9100);

const options = { encoding: "cp857" /* default */ };

const printer = new escpos.Printer(networkDevice, options);

const tux = path.join(__dirname, "./tux.png");

const characterPerLineFontB = 68;
const characterPerLineFontA = 50;

const fullLineTextB = String("").padStart(characterPerLineFontB, "b");
const fullLineTextA = String("").padStart(characterPerLineFontA, "a");

networkDevice.open(function (error) {
  if (error) {
    console.error(error);
  } else {
    // const turkishText = "çÇöÖşŞİıüÜĞğ"; // Türkçe metin

    const menuItems = [
      { name: "Ali baba köfte", price: "250.00tl", quantity: 1 },
      {
        name: "Ali baba köfte asds sdad dobulwpeynir gghghgghghhg hjjhhhgg",
        price: "250.00tl",
        quantity: 2,
      },
      { name: "Kahve", price: "20.00tl", quantity: 2 },
      { name: "Çay", price: "1tl", quantity: 1 },
    ];

    const entryDate = new Date();
    const tableNumber = "5"; // Assuming table number is 5, replace with the actual table number
    const staffExitTime = "18:30"; // Replace with the actual staff exit time

    // Load the image
    escpos.Image.load(tux, function (image) {
      // Print the image and Turkish text
      printer.align("CT").font("A").size(0, 0).style("B").image(image, "d24"); // 'd24' is the printing density, adjust as needed

      printer
        .newLine()
        .align("LT")
        .pureText(`Tarih: ${entryDate.toLocaleDateString()}`)
        .newLine()
        .pureText(`Giriş Saati: ${entryDate.toLocaleTimeString()}`)
        .newLine()
        .pureText(`Masa: ${tableNumber}`)
        .newLine()
        .pureText(`Çıkış Saati: ${staffExitTime}`)
        .newLine()
        .pureText(`Personel : `)
        .newLine()
        .align("CT")
        .drawLine();

      menuItems.forEach((menuItem) => {
        const diff = characterPerLineFontA;
        let name = menuItem.name;

        if (menuItem.name.length > characterPerLineFontA) {
          name = menuItem.name.substring(
            0,
            characterPerLineFontA - menuItem.price.length - 5
          );
        }

        printer
          .align("CT")
          .pureText(
            `${menuItem.quantity}x ${String(name).padEnd(
              diff - menuItem.price.length - 3,
              " "
            )}`
          )

          .pureText(String(menuItem.price))
          .newLine();
      });

      // Calculate total, VAT (KDV), and grand total
      const total = menuItems.reduce(
        (acc, item) => acc + parseFloat(item.price),
        0
      );
      const kdv = total * 0.18; // Assuming 18% VAT, adjust as needed
      const grandTotal = total + kdv;

      // Print the totals
      printer

        .newLine()
        .drawLine()
        .size(0.1, 0.1)
        .align("RT")
        .spacing(0.1)
        .pureText(`Toplam: ${total.toFixed(2)}TL`)
        .align("CT")
        .newLine()
        .size(0, 0)
        .drawLine()
        .cut()
        .close();

      // Print the date, entry time, table number, and staff exit time
    });
  }
});
