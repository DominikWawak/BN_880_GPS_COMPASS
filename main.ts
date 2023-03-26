function initGPS () {
    serial.redirect(
    SerialPin.P13,
    SerialPin.P14,
    BaudRate.BaudRate9600
    )
    serial.setTxBufferSize(64)
    serial.setRxBufferSize(64)
}
function getGPSLL () {
    latlong2 = serial.readLine()
    if (latlong2) {
        values2 = latlong2.split(",")
        if (values2[0] == "$GNGLL") {
            latitude = parseFloat(values2[1])
            dir1 = values2[2]
            longitude = parseFloat(values2[3])
            dir2 = values2[4]
            if (dir1 == "S") {
                latitude = 0 - latitude
            }
            if (dir2 == "W") {
                longitude = 0 - longitude
            }
            latdeg = Math.floor(latitude / 100)
            latmin = latitude % 100 + (latitude - latdeg * 100) * 0.6
            londeg = Math.floor(longitude / 100)
            lonmin = longitude % 100 + (longitude - londeg * 100) * 0.6
            lat = latdeg + latmin / 100
            lon = londeg + lonmin / 100
        }
    }
}
// Get compass heading from HMC5883L
function getHeading () {
    // Read data registers 3 through 8
    pins.i2cWriteNumber(
    addr,
    dataReg,
    NumberFormat.UInt8LE,
    true
    )
    let buffer = pins.i2cReadBuffer(addr, 6, false)
let x = buffer.getNumber(NumberFormat.Int16LE, 0)
let z = buffer.getNumber(NumberFormat.Int16LE, 2)
let y = buffer.getNumber(NumberFormat.Int16LE, 4)
heading = Math.atan2(y, x) * 180 / Math.PI
    if (heading < 0) {
        heading += 360
    }
}
// Variable to store heading value
// 
// Set HMC5883L to continuous measurement mode
function initCompass () {
    let bufr = control.createBuffer(2)
bufr.setNumber(NumberFormat.Int8LE, 0, regA)
bufr.setNumber(NumberFormat.Int8LE, 1, 0x70)
pins.i2cWriteBuffer(addr, bufr, false)
let bufr2 = control.createBuffer(2)
bufr2.setNumber(NumberFormat.Int8LE, 0, regB)
bufr2.setNumber(NumberFormat.Int8LE, 1, 0xA0)
pins.i2cWriteBuffer(addr, bufr2, false)
let bufr3 = control.createBuffer(2)
bufr3.setNumber(NumberFormat.Int8LE, 0, modeReg)
bufr3.setNumber(NumberFormat.Int8LE, 1, 0x00)
pins.i2cWriteBuffer(addr, bufr3, false)
basic.pause(6)
}
let heading = 0
let lonmin = 0
let londeg = 0
let latmin = 0
let latdeg = 0
let dir2 = ""
let longitude = 0
let dir1 = ""
let latitude = 0
let values2: string[] = []
let lon = 0
let lat = 0
let latlong2 = ""
let dataReg = 0
let regA = 0
let addr = 0
// Address of HMC5883L magnetometer
addr = 30
let regB = 1
let modeReg = 2
dataReg = 3
latlong2 = ""
lat = 0
lon = 0
radio.setGroup(23)
initGPS()
// Initialize HMC5883L and continuously read compass heading
initCompass()
basic.showIcon(IconNames.Heart)
basic.clearScreen()
basic.forever(function () {
    getGPSLL()
    led.toggle(0, 0)
    getHeading()
    led.toggle(4, 0)
    radio.sendValue("compass", heading)
    basic.pause(100)
    radio.sendValue("long", lon)
    basic.pause(100)
    radio.sendValue("lat", lat)
    basic.pause(100)
})
