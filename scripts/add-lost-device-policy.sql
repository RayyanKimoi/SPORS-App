-- Allow any authenticated user to view devices with status 'lost'
-- This is required for the BLE scanner to find nearby lost devices
CREATE POLICY "Anyone can view lost devices"
ON public.devices
FOR SELECT
TO authenticated
USING (status = 'lost');
