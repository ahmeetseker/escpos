const escpos = require("escpos");
escpos.Network = require("escpos-network");
const path = require("path");

const networkDevice = new escpos.Network("192.168.2.84", 9100);

const options = { encoding: "cp857" /* default */ };

const printer = new escpos.Printer(networkDevice, options);

const tux = path.join(__dirname, "./tux.png");

const characterPerLineFontB = 64;
const characterPerLineFontA = 48;

const drawLine = () => {
  printer.text(String("").padStart(characterPerLineFontA, "-"));
};

const drawLineCenter = () => {
  printer.text(
    String("")
      .padStart(6, "+")
      .padEnd(characterPerLineFontA - 12, "-")
  );
};

networkDevice.open(function (error) {
  if (error) {
    console.error(error);
  } else {
    const menuItems = [
      {
        name: "Ali baba köfte",
        quantity: 1,
        variants: "Acili",
      },
      {
        name: "Adana",
        quantity: 1,
        variants: "Acili",
        note: "Adana kebap siparişimde lütfen bol soğan koymayın. Yanına da mezelerden biraz fazla koyarsanız harika olur. ",
      },
      {
        name: "Böf stragonof, chato biryan,enginar yatağında trüf mantarlı kremalı yengeç şeridi, sarımsaklı tereyağlı fırın salyongoz ",
        quantity: 2,
      },
      { name: "Kahve", quantity: 2 },
      {
        name: "Çay",
        variants: ["FINCAN", "SEKERLI"],
        quantity: 1,
        note: "SEKERI AZ OLSUN",
      },
    ];

    const entryDate = new Date();
    const tableNumber = "5"; // Assuming table number is 5, replace with the actual table number

    // Load the image
    escpos.Image.load(tux, function (image) {
      // Print the image and Turkish text
      printer.align("CT").font("A").size(0, 0).style("B");
      // .image(image, 'd24')
      // 'd24' is the printing density, adjust as needed
      printer.align("CT").size(1, 1).pureText("MUTFAK").newLine();

      printer
        .size(0, 0)
        .newLine()
        .align("LT")
        .pureText(`Tarih: ${entryDate.toLocaleDateString()}`)
        .newLine()
        .pureText(
          `Sipariş Saati: ${entryDate.toLocaleTimeString("tr-TR", {
            hour12: false,
          })}`
        )
        .newLine()
        .pureText(`Masa: ${tableNumber}`)
        .newLine()

        .pureText(`Personel : `)
        .newLine()
        .align("CT")
        .drawLine();

      menuItems.forEach((menuItem, index) => {
        const diff = characterPerLineFontA;

        let name = menuItem.name;

        if (menuItem.name.length > characterPerLineFontA) {
          name = menuItem.name.substring(0, characterPerLineFontA - 6);
        }

        // Eğer varyantlar varsa, bunları öğe adına ekleyin
        const itemWithVariants = menuItem.variants
          ? `${name}\n  *${menuItem.variants}`
          : name;

        printer
          .align("LT")
          .pureText(
            `${menuItem.quantity}x ${String(itemWithVariants).padEnd(
              diff - 3,
              ""
            )}`
          );

        if (menuItem.note) {
          printer.newLine();
        }
        printer.pureText(menuItem.note).newLine();

        // Her menü öğesi için yeni bir çizgi ekleyin (son öğeden sonra çizgi eklenmemesi için kontrol)
        if (index < menuItems.length - 1) {
          drawLine();
          drawLineCenter();
        }
      });

      printer
        .drawLine()
        .newLine()
        .cut()

        .newLine()
        .close();
    });
  }
});
