/** URL-safe id from a lead's name, e.g. "Bilal Hussain" → "bilal-hussain". Matches the Leads table row ids. */
export const slug = (name: string) => name.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');

/** Link to a lead's own profile. Faraz Ahmed keeps his detailed sample record. */
export const leadPath = (name: string) => (name === 'Faraz Ahmed' ? '/leads/L-20931' : `/leads/${slug(name)}`);
