def initGPS():
    serial.redirect(SerialPin.P13, SerialPin.P14, BaudRate.BAUD_RATE9600)
# Variable to store heading value
# 
# Set HMC5883L to continuous measurement mode
def init():
    bufr = bytearray(2)
    bufr.set_number(NumberFormat.INT8_LE, 0, regA)
    bufr.set_number(NumberFormat.INT8_LE, 1, 0x70)
    pins.i2c_write_buffer(addr, bufr, False)
    bufr2 = bytearray(2)
    bufr2.set_number(NumberFormat.INT8_LE, 0, regB)
    bufr2.set_number(NumberFormat.INT8_LE, 1, 0xA0)
    pins.i2c_write_buffer(addr, bufr2, False)
    bufr3 = bytearray(2)
    bufr3.set_number(NumberFormat.INT8_LE, 0, modeReg)
    bufr3.set_number(NumberFormat.INT8_LE, 1, 0x00)
    pins.i2c_write_buffer(addr, bufr3, False)
    basic.pause(6)
# Get compass heading from HMC5883L
def getHeading():
    global heading
    # Read data registers 3 through 8
    pins.i2c_write_number(addr, dataReg, NumberFormat.UINT8_LE, True)
    buffer = pins.i2c_read_buffer(addr, 6, False)
    x = buffer.get_number(NumberFormat.INT16_LE, 0)
    z = buffer.get_number(NumberFormat.INT16_LE, 2)
    y = buffer.get_number(NumberFormat.INT16_LE, 4)
    heading = Math.atan2(y, x) * 180 / Math.PI
    if heading < 0:
        heading += 360
lonmin = 0
londeg = 0
latmin = 0
latdeg = 0
dir2 = ""
longitude = 0
dir1 = ""
latitude = 0
heading = 0
dataReg = 0
addr = 0
regA = 0
latlong = ""
values: List[str] = []
microIoT.microIoT_WIFI("Galaxyz", "44445555")
microIoT.microIoT_MQTT("9h1rq3Hf5cxTeQcb2yTYK3N6",
    "m33rs3IoJWxT9eX01hoxTLIDfLtq3EWN",
    "test/compass",
    microIoT.SERVERS.GLOBAL)
microIoT.microIoT_add_topic(microIoT.TOPIC.TOPIC_1, "test/latLong")
basic.show_icon(IconNames.HEART)
basic.clear_screen()
# Address of HMC5883L magnetometer
addr = 30
regB = 1
modeReg = 2
dataReg = 3
initGPS()
# Initialize HMC5883L and continuously read compass heading
init()

def on_forever():
    global latlong, values, latitude, dir1, longitude, dir2, latdeg, latmin, londeg, lonmin
    latlong = serial.read_string()
    if latlong:
        values = latlong.split(",")
        if values[0] == "$GNGLL":
            latitude = parse_float(values[1])
            dir1 = values[2]
            longitude = parse_float(values[3])
            dir2 = values[4]
            if dir1 == "S":
                latitude = 0 - latitude
            if dir2 == "W":
                longitude = 0 - longitude
            latdeg = Math.floor(latitude / 100)
            latmin = latitude % 100 + (latitude - latdeg * 100) * 0.6
            londeg = Math.floor(longitude / 100)
            lonmin = longitude % 100 + (longitude - londeg * 100) * 0.6
            led.toggle(0, 0)
            microIoT.microIoT_SendMessage("" + str(latdeg) + "." + str(latmin) + "," + str(londeg) + "." + str(lonmin),
                microIoT.TOPIC.TOPIC_1)
            microIoT.microIoT_SendMessage("{\"" + "latitude" + "\":" + ("" + str(latdeg) + "." + str(latmin) + "," + str(londeg) + "." + str(lonmin)) + ",\"ispublic\":true}",
                        microIoT.TOPIC.TOPIC_0)
    getHeading()
   
    microIoT.microIoT_SendMessage("{\"" + "compass" + "\":" + ("" + str(heading)) + ",\"ispublic\":true}",
            microIoT.TOPIC.TOPIC_0)
    led.toggle(4, 0)
basic.forever(on_forever)
