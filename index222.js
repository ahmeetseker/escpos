const escpos = require('escpos');
escpos.Network = require('escpos-network');
const path = require('path'); // path modülünü içe aktar

const networkDevice = new escpos.Network('192.168.2.84', 9100);

const printer = new escpos.Printer(networkDevice);

const tux = path.join(__dirname, 'chef.jpg'); // path modülünü kullanarak dosya yolunu oluştur

networkDevice.open(function (error) {
  if (error) {
    console.error(error);
  } else {
    escpos.Image.load(tux, function (image) {
      printer.align('ct')
             .image(image, 'd24')
             .then(() => {
                printer.cut().close();
             });
    });
  }
});
