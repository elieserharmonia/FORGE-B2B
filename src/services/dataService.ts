import { supabase } from '../lib/supabase';
import { ForecastItem, Customer, CommandCenterTask } from '../types';

export const dataService = {
  async getForecasts(orgId: string): Promise<ForecastItem[]> {
    const { data, error } = await supabase
      .from('forecasts')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async saveForecast(item: ForecastItem): Promise<ForecastItem> {
    const { data, error } = await supabase
      .from('forecasts')
      .upsert({
        ...item,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteForecast(id: string, orgId: string): Promise<void> {
    const { error } = await supabase
      .from('forecasts')
      .delete()
      .eq('id', id)
      .eq('org_id', orgId);
    
    if (error) throw error;
  },

  async getCustomers(orgId: string): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('org_id', orgId)
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async saveCustomer(customer: Customer): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .upsert(customer)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getTasks(orgId: string): Promise<CommandCenterTask[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('org_id', orgId)
      .order('date');
    
    if (error) throw error;
    return data || [];
  },

  async saveTask(task: CommandCenterTask): Promise<CommandCenterTask> {
    const { data, error } = await supabase
      .from('tasks')
      .upsert(task)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteTask(id: string, orgId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('org_id', orgId);
    
    if (error) throw error;
  },

  async deleteCustomer(id: string, orgId: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
      .eq('org_id', orgId);
    
    if (error) throw error;
  }
};
