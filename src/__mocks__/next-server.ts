export const NextResponse = {
  json: (data: any, init?: any) => ({ data, init }),
}

export const revalidatePath = () => {}
export const revalidateTag = () => {}
export const cookies = () => ({ get: vi.fn(), set: vi.fn() })
export const headers = () => ({ get: vi.fn() })
