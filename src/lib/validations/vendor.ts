import { z } from 'zod'

export const vendorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(9, 'Enter a valid phone number'),
  product_name: z.string().min(2, 'Product name is required'),
  category: z.string().min(2, 'Category is required'),
  price: z.number().min(0, 'Price cannot be negative'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})

export type VendorFormData = z.infer<typeof vendorSchema>