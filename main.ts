namespace BN880_HMC{

    
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
    let dataReg = 3
    let regA = 0
    let addr = 30
    let regB = 1
    let modeReg = 2
    
  
    //% blockId=initialize_GPS
    //% block = "initGPS"

    export function initGPS() : void {
        serial.redirect(
            SerialPin.P13,
            SerialPin.P14,
            BaudRate.BaudRate9600
        )
        serial.setTxBufferSize(64)
        serial.setRxBufferSize(64)
    }


    //% blockId=getLatitudeLongitude
    //% block="get latitude and longitude as string"
    export function getGPSLL() : string {
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
                return lat+","+lon
            }
        }
        return "not found"
    }



    // Get compass heading from HMC5883L

    //% blockId=getCompassHeading
    //% block = "get compass direction"
    //% offset.min=0 offset.max=360
    export function getHeading(offset:number):number {
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
        let heading = Math.atan2(y, x) * 180 / Math.PI
        heading=heading-offset
        if (heading < 0) {
            heading += 360
        }
        return heading
    }


    // Set HMC5883L to continuous measurement mode
    //% blockId=initializeCompass
    //% block="initialize compass continious mode"

    export function initCompass():void  {
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

}




