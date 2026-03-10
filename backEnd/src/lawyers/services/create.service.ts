import {prisma} from '../../lib/prisma'

interface IDataService{
  name: string
  email: string
  oabNumber: string
  specialty:string
  phone:string
  
}

export const createService= async(data:IDataService)=>{
    try{
        const lawyer = await prisma.lawyer.create({
            data:{
                name: data.name,
                email: data.email,
                oabNumber: data.oabNumber,
                specialty: data.specialty,
                phone: data.phone,
            }
        })
        return lawyer

    }catch(error){
        console.log(error)
    }
}


