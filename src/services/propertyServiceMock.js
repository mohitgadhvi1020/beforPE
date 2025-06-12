import { v4 as uuidv4 } from 'uuid';

// Mock data storage (in-memory for development)
let mockProperties = [
  // Michael Johnson (agent-1) properties
  {
    id: 'prop-1',
    agent_user_id: 'agent-1',
    title: 'Modern Downtown Apartment',
    description: 'A beautiful 2-bedroom apartment in the heart of downtown with stunning city views.',
    property_type: 'apartment',
    price: 350000,
    location: {
      address: '123 Downtown Ave',
      city: 'San Francisco',
      state: 'CA',
      zip_code: '94102',
      latitude: 37.7749,
      longitude: -122.4194
    },
    features: {
      bedrooms: 2,
      bathrooms: 2,
      square_feet: 1200,
      parking: true,
      balcony: true
    },
    images: ['downtown-apt-1.jpg', 'downtown-apt-2.jpg'],
    status: 'available',
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2024-01-15')
  },
  {
    id: 'prop-2',
    agent_user_id: 'agent-1',
    title: 'Cozy Suburban House',
    description: 'A charming 3-bedroom house in a quiet suburban neighborhood, perfect for families.',
    property_type: 'house',
    price: 525000,
    location: {
      address: '456 Oak Street',
      city: 'Palo Alto',
      state: 'CA',
      zip_code: '94301',
      latitude: 37.4419,
      longitude: -122.1430
    },
    features: {
      bedrooms: 3,
      bathrooms: 2.5,
      square_feet: 1800,
      parking: true,
      garden: true,
      garage: true
    },
    images: ['suburban-house-1.jpg', 'suburban-house-2.jpg', 'suburban-house-3.jpg'],
    status: 'available',
    created_at: new Date('2024-01-10'),
    updated_at: new Date('2024-01-10')
  },
  {
    id: 'prop-11',
    agent_user_id: 'agent-1',
    title: 'Executive Condo with City Views',
    description: 'Luxurious executive condominium with floor-to-ceiling windows and premium finishes.',
    property_type: 'condo',
    price: 675000,
    location: {
      address: '888 Executive Plaza',
      city: 'San Francisco',
      state: 'CA',
      zip_code: '94111',
      latitude: 37.7849,
      longitude: -122.4094
    },
    features: {
      bedrooms: 2,
      bathrooms: 2,
      square_feet: 1350,
      parking: true,
      balcony: true,
      concierge: true,
      gym: true
    },
    images: ['exec-condo-1.jpg', 'exec-condo-2.jpg'],
    status: 'available',
    created_at: new Date('2024-01-18'),
    updated_at: new Date('2024-01-18')
  },
  {
    id: 'prop-12',
    agent_user_id: 'agent-1',
    title: 'Family Home with Large Yard',
    description: 'Spacious family home with large backyard, perfect for children and pets.',
    property_type: 'house',
    price: 785000,
    location: {
      address: '234 Family Lane',
      city: 'Fremont',
      state: 'CA',
      zip_code: '94536',
      latitude: 37.5485,
      longitude: -121.9886
    },
    features: {
      bedrooms: 4,
      bathrooms: 3,
      square_feet: 2100,
      parking: true,
      garage: true,
      large_yard: true,
      playground: true
    },
    images: ['family-home-1.jpg', 'family-home-2.jpg', 'family-home-3.jpg'],
    status: 'available',
    created_at: new Date('2024-01-20'),
    updated_at: new Date('2024-01-20')
  },

  // Sarah Williams (agent-2) properties
  {
    id: 'prop-3',
    agent_user_id: 'agent-2',
    title: 'Luxury Penthouse',
    description: 'An exclusive penthouse with panoramic views and premium amenities.',
    property_type: 'apartment',
    price: 1200000,
    location: {
      address: '789 Luxury Blvd',
      city: 'San Francisco',
      state: 'CA',
      zip_code: '94105',
      latitude: 37.7849,
      longitude: -122.4094
    },
    features: {
      bedrooms: 4,
      bathrooms: 3,
      square_feet: 2500,
      parking: true,
      balcony: true,
      pool: true,
      gym: true
    },
    images: ['penthouse-1.jpg', 'penthouse-2.jpg', 'penthouse-3.jpg', 'penthouse-4.jpg'],
    status: 'available',
    created_at: new Date('2024-01-05'),
    updated_at: new Date('2024-01-05')
  },
  {
    id: 'prop-4',
    agent_user_id: 'agent-2',
    title: 'Waterfront Condo',
    description: 'Stunning waterfront condominium with breathtaking bay views and modern finishes.',
    property_type: 'condo',
    price: 750000,
    location: {
      address: '321 Marina Drive',
      city: 'Sausalito',
      state: 'CA',
      zip_code: '94965',
      latitude: 37.8590,
      longitude: -122.4852
    },
    features: {
      bedrooms: 2,
      bathrooms: 2,
      square_feet: 1400,
      parking: true,
      balcony: true,
      water_view: true
    },
    images: ['waterfront-condo-1.jpg', 'waterfront-condo-2.jpg'],
    status: 'available',
    created_at: new Date('2024-01-12'),
    updated_at: new Date('2024-01-12')
  },
  {
    id: 'prop-13',
    agent_user_id: 'agent-2',
    title: 'High-Rise Studio with Amenities',
    description: 'Modern studio apartment in luxury high-rise with full amenities package.',
    property_type: 'apartment',
    price: 285000,
    location: {
      address: '555 High Rise Tower',
      city: 'San Francisco',
      state: 'CA',
      zip_code: '94103',
      latitude: 37.7749,
      longitude: -122.4194
    },
    features: {
      bedrooms: 0,
      bathrooms: 1,
      square_feet: 650,
      parking: false,
      balcony: true,
      gym: true,
      pool: true,
      concierge: true
    },
    images: ['studio-1.jpg', 'studio-2.jpg'],
    status: 'available',
    created_at: new Date('2024-01-22'),
    updated_at: new Date('2024-01-22')
  },
  {
    id: 'prop-14',
    agent_user_id: 'agent-2',
    title: 'Luxury Duplex',
    description: 'Elegant duplex with private entrance and rooftop terrace in prime location.',
    property_type: 'apartment',
    price: 950000,
    location: {
      address: '777 Duplex Drive',
      city: 'San Francisco',
      state: 'CA',
      zip_code: '94115',
      latitude: 37.7849,
      longitude: -122.4394
    },
    features: {
      bedrooms: 3,
      bathrooms: 2.5,
      square_feet: 1900,
      parking: true,
      rooftop_terrace: true,
      private_entrance: true,
      fireplace: true
    },
    images: ['duplex-1.jpg', 'duplex-2.jpg', 'duplex-3.jpg'],
    status: 'available',
    created_at: new Date('2024-01-16'),
    updated_at: new Date('2024-01-16')
  },

  // David Brown (agent-3) properties
  {
    id: 'prop-5',
    agent_user_id: 'agent-3',
    title: 'Historic Victorian Home',
    description: 'Beautifully restored Victorian home with original details and modern updates.',
    property_type: 'house',
    price: 895000,
    location: {
      address: '567 Victorian Lane',
      city: 'San Francisco',
      state: 'CA',
      zip_code: '94117',
      latitude: 37.7699,
      longitude: -122.4481
    },
    features: {
      bedrooms: 4,
      bathrooms: 3,
      square_feet: 2200,
      parking: false,
      garden: true,
      fireplace: true,
      historic: true
    },
    images: ['victorian-1.jpg', 'victorian-2.jpg', 'victorian-3.jpg'],
    status: 'available',
    created_at: new Date('2024-01-08'),
    updated_at: new Date('2024-01-08')
  },
  {
    id: 'prop-6',
    agent_user_id: 'agent-3',
    title: 'Modern Townhouse',
    description: 'Contemporary 3-story townhouse with rooftop deck and garage.',
    property_type: 'townhouse',
    price: 680000,
    location: {
      address: '890 Modern Way',
      city: 'Oakland',
      state: 'CA',
      zip_code: '94612',
      latitude: 37.8044,
      longitude: -122.2712
    },
    features: {
      bedrooms: 3,
      bathrooms: 2.5,
      square_feet: 1600,
      parking: true,
      garage: true,
      rooftop_deck: true
    },
    images: ['townhouse-1.jpg', 'townhouse-2.jpg'],
    status: 'available',
    created_at: new Date('2024-01-14'),
    updated_at: new Date('2024-01-14')
  },
  {
    id: 'prop-15',
    agent_user_id: 'agent-3',
    title: 'Craftsman Bungalow',
    description: 'Charming craftsman bungalow with original hardwood floors and built-in cabinets.',
    property_type: 'house',
    price: 625000,
    location: {
      address: '345 Craftsman Circle',
      city: 'Berkeley',
      state: 'CA',
      zip_code: '94702',
      latitude: 37.8715,
      longitude: -122.2730
    },
    features: {
      bedrooms: 2,
      bathrooms: 1.5,
      square_feet: 1100,
      parking: true,
      garden: true,
      hardwood_floors: true,
      craftsman_style: true
    },
    images: ['craftsman-1.jpg', 'craftsman-2.jpg'],
    status: 'available',
    created_at: new Date('2024-01-19'),
    updated_at: new Date('2024-01-19')
  },
  {
    id: 'prop-16',
    agent_user_id: 'agent-3',
    title: 'Contemporary Loft Townhouse',
    description: 'Sleek contemporary townhouse with open floor plan and industrial touches.',
    property_type: 'townhouse',
    price: 720000,
    location: {
      address: '456 Loft Street',
      city: 'Emeryville',
      state: 'CA',
      zip_code: '94608',
      latitude: 37.8314,
      longitude: -122.2834
    },
    features: {
      bedrooms: 2,
      bathrooms: 2.5,
      square_feet: 1450,
      parking: true,
      garage: true,
      open_floor_plan: true,
      industrial_design: true
    },
    images: ['loft-townhouse-1.jpg', 'loft-townhouse-2.jpg'],
    status: 'available',
    created_at: new Date('2024-01-21'),
    updated_at: new Date('2024-01-21')
  },

  // Jennifer Davis (agent-4) properties
  {
    id: 'prop-7',
    agent_user_id: 'agent-4',
    title: 'Luxury Estate',
    description: 'Magnificent estate home with pool, tennis court, and panoramic valley views.',
    property_type: 'house',
    price: 2500000,
    location: {
      address: '1234 Estate Drive',
      city: 'Los Altos Hills',
      state: 'CA',
      zip_code: '94022',
      latitude: 37.3861,
      longitude: -122.1014
    },
    features: {
      bedrooms: 6,
      bathrooms: 5,
      square_feet: 4500,
      parking: true,
      garage: true,
      pool: true,
      tennis_court: true,
      wine_cellar: true
    },
    images: ['estate-1.jpg', 'estate-2.jpg', 'estate-3.jpg', 'estate-4.jpg'],
    status: 'available',
    created_at: new Date('2024-01-03'),
    updated_at: new Date('2024-01-03')
  },
  {
    id: 'prop-8',
    agent_user_id: 'agent-4',
    title: 'Silicon Valley Starter Home',
    description: 'Perfect starter home in the heart of Silicon Valley with great potential.',
    property_type: 'house',
    price: 1100000,
    location: {
      address: '456 Tech Street',
      city: 'Mountain View',
      state: 'CA',
      zip_code: '94041',
      latitude: 37.3861,
      longitude: -122.0839
    },
    features: {
      bedrooms: 3,
      bathrooms: 2,
      square_feet: 1500,
      parking: true,
      garage: true,
      garden: true
    },
    images: ['starter-home-1.jpg', 'starter-home-2.jpg'],
    status: 'available',
    created_at: new Date('2024-01-11'),
    updated_at: new Date('2024-01-11')
  },
  {
    id: 'prop-17',
    agent_user_id: 'agent-4',
    title: 'Executive Ranch Home',
    description: 'Spacious single-story ranch home with premium upgrades and large lot.',
    property_type: 'house',
    price: 1450000,
    location: {
      address: '789 Ranch Road',
      city: 'Los Gatos',
      state: 'CA',
      zip_code: '95032',
      latitude: 37.2358,
      longitude: -121.9623
    },
    features: {
      bedrooms: 4,
      bathrooms: 3,
      square_feet: 2800,
      parking: true,
      garage: true,
      large_lot: true,
      single_story: true,
      premium_upgrades: true
    },
    images: ['ranch-1.jpg', 'ranch-2.jpg', 'ranch-3.jpg'],
    status: 'available',
    created_at: new Date('2024-01-17'),
    updated_at: new Date('2024-01-17')
  },
  {
    id: 'prop-18',
    agent_user_id: 'agent-4',
    title: 'Modern Smart Home',
    description: 'Cutting-edge smart home with automated systems and energy-efficient features.',
    property_type: 'house',
    price: 1650000,
    location: {
      address: '321 Smart Home Ave',
      city: 'Cupertino',
      state: 'CA',
      zip_code: '95014',
      latitude: 37.3230,
      longitude: -122.0322
    },
    features: {
      bedrooms: 4,
      bathrooms: 3.5,
      square_feet: 2600,
      parking: true,
      garage: true,
      smart_home: true,
      solar_panels: true,
      automated_systems: true
    },
    images: ['smart-home-1.jpg', 'smart-home-2.jpg'],
    status: 'available',
    created_at: new Date('2024-01-23'),
    updated_at: new Date('2024-01-23')
  },

  // Robert Miller (agent-5) properties
  {
    id: 'prop-9',
    agent_user_id: 'agent-5',
    title: 'Beachside Retreat',
    description: 'Charming beach house just steps from the ocean with stunning sunset views.',
    property_type: 'house',
    price: 1350000,
    location: {
      address: '789 Ocean View Drive',
      city: 'Half Moon Bay',
      state: 'CA',
      zip_code: '94019',
      latitude: 37.4636,
      longitude: -122.4286
    },
    features: {
      bedrooms: 3,
      bathrooms: 2,
      square_feet: 1700,
      parking: true,
      deck: true,
      ocean_view: true,
      fireplace: true
    },
    images: ['beach-house-1.jpg', 'beach-house-2.jpg', 'beach-house-3.jpg'],
    status: 'available',
    created_at: new Date('2024-01-06'),
    updated_at: new Date('2024-01-06')
  },
  {
    id: 'prop-10',
    agent_user_id: 'agent-5',
    title: 'Urban Loft',
    description: 'Trendy loft in converted warehouse with exposed brick and high ceilings.',
    property_type: 'apartment',
    price: 425000,
    location: {
      address: '101 Warehouse District',
      city: 'San Francisco',
      state: 'CA',
      zip_code: '94107',
      latitude: 37.7749,
      longitude: -122.3927
    },
    features: {
      bedrooms: 1,
      bathrooms: 1,
      square_feet: 900,
      parking: false,
      exposed_brick: true,
      high_ceilings: true,
      industrial: true
    },
    images: ['loft-1.jpg', 'loft-2.jpg'],
    status: 'available',
    created_at: new Date('2024-01-13'),
    updated_at: new Date('2024-01-13')
  },
  {
    id: 'prop-19',
    agent_user_id: 'agent-5',
    title: 'Mountain View Cabin',
    description: 'Rustic cabin with modern amenities nestled in the Santa Cruz Mountains.',
    property_type: 'house',
    price: 575000,
    location: {
      address: '123 Mountain Trail',
      city: 'Santa Cruz',
      state: 'CA',
      zip_code: '95060',
      latitude: 36.9741,
      longitude: -122.0308
    },
    features: {
      bedrooms: 2,
      bathrooms: 2,
      square_feet: 1200,
      parking: true,
      deck: true,
      mountain_view: true,
      fireplace: true,
      rustic: true
    },
    images: ['cabin-1.jpg', 'cabin-2.jpg'],
    status: 'available',
    created_at: new Date('2024-01-24'),
    updated_at: new Date('2024-01-24')
  },
  {
    id: 'prop-20',
    agent_user_id: 'agent-5',
    title: 'Luxury Marina Condo',
    description: 'Upscale marina condominium with boat slip and panoramic water views.',
    property_type: 'condo',
    price: 890000,
    location: {
      address: '456 Marina Boulevard',
      city: 'Richmond',
      state: 'CA',
      zip_code: '94804',
      latitude: 37.9358,
      longitude: -122.3477
    },
    features: {
      bedrooms: 2,
      bathrooms: 2,
      square_feet: 1300,
      parking: true,
      balcony: true,
      boat_slip: true,
      water_view: true,
      marina_access: true
    },
    images: ['marina-condo-1.jpg', 'marina-condo-2.jpg', 'marina-condo-3.jpg'],
    status: 'available',
    created_at: new Date('2024-01-25'),
    updated_at: new Date('2024-01-25')
  }
];

let mockUsers = {
  'agent-1': {
    id: 'agent-1',
    first_name: 'Michael',
    last_name: 'Johnson',
    email: 'michael.johnson@realestate.com',
    phone: '+1-415-555-0101',
    send_bird_id: 'agent_michael_johnson'
  },
  'agent-2': {
    id: 'agent-2',
    first_name: 'Sarah',
    last_name: 'Williams',
    email: 'sarah.williams@realestate.com',
    phone: '+1-415-555-0102',
    send_bird_id: 'agent_sarah_williams'
  },
  'agent-3': {
    id: 'agent-3',
    first_name: 'David',
    last_name: 'Brown',
    email: 'david.brown@realestate.com',
    phone: '+1-415-555-0103',
    send_bird_id: 'agent_david_brown'
  },
  'agent-4': {
    id: 'agent-4',
    first_name: 'Jennifer',
    last_name: 'Davis',
    email: 'jennifer.davis@realestate.com',
    phone: '+1-415-555-0104',
    send_bird_id: 'agent_jennifer_davis'
  },
  'agent-5': {
    id: 'agent-5',
    first_name: 'Robert',
    last_name: 'Miller',
    email: 'robert.miller@realestate.com',
    phone: '+1-415-555-0105',
    send_bird_id: 'agent_robert_miller'
  }
};

class PropertyServiceMock {
  constructor() {
    console.log('Using Mock Property Service for development');
  }

  // Create new property (agent only)
  async createProperty(agentUserId, propertyData) {
    try {
      const propertyId = uuidv4();
      
      const property = {
        id: propertyId,
        agent_user_id: agentUserId,
        title: propertyData.title,
        description: propertyData.description,
        property_type: propertyData.property_type,
        price: propertyData.price,
        location: propertyData.location,
        features: propertyData.features || {},
        images: propertyData.images || [],
        status: propertyData.status || 'available',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockProperties.push(property);

      // Get agent details
      const agentData = mockUsers[agentUserId] || {
        first_name: 'Demo',
        last_name: 'Agent',
        email: 'demo@example.com',
        phone: '+1234567890',
        send_bird_id: 'demo_agent'
      };

      return {
        ...property,
        agent_first_name: agentData.first_name,
        agent_last_name: agentData.last_name,
        agent_email: agentData.email,
        agent_phone: agentData.phone,
        agent_send_bird_id: agentData.send_bird_id
      };
    } catch (error) {
      throw new Error(`Failed to create property: ${error.message}`);
    }
  }

  // Get all properties with optional filters
  async getAllProperties(filters = {}, page = 1, limit = 20) {
    try {
      let filteredProperties = [...mockProperties];

      // Apply filters
      if (!filters.agent_id) {
        filteredProperties = filteredProperties.filter(p => p.status === 'available');
      }

      if (filters.agent_id) {
        filteredProperties = filteredProperties.filter(p => p.agent_user_id === filters.agent_id);
      }

      if (filters.property_type) {
        filteredProperties = filteredProperties.filter(p => p.property_type === filters.property_type);
      }

      if (filters.price_min) {
        filteredProperties = filteredProperties.filter(p => p.price >= filters.price_min);
      }

      if (filters.price_max) {
        filteredProperties = filteredProperties.filter(p => p.price <= filters.price_max);
      }

      // Sort by created_at desc
      filteredProperties.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProperties = filteredProperties.slice(startIndex, endIndex);

      // Add agent details to each property
      const propertiesWithAgents = paginatedProperties.map(property => {
        const agentData = mockUsers[property.agent_user_id] || {
          first_name: 'Demo',
          last_name: 'Agent',
          email: 'demo@example.com',
          phone: '+1234567890',
          send_bird_id: 'demo_agent'
        };

        return {
          ...property,
          agent_first_name: agentData.first_name,
          agent_last_name: agentData.last_name,
          agent_email: agentData.email,
          agent_phone: agentData.phone,
          agent_send_bird_id: agentData.send_bird_id
        };
      });

      return {
        properties: propertiesWithAgents,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(filteredProperties.length / limit),
          total_count: filteredProperties.length,
          per_page: limit
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch properties: ${error.message}`);
    }
  }

  // Get property by ID
  async getPropertyById(propertyId) {
    try {
      const property = mockProperties.find(p => p.id === propertyId);
      
      if (!property) {
        throw new Error('Property not found');
      }

      // Get agent details
      const agentData = mockUsers[property.agent_user_id] || {
        first_name: 'Demo',
        last_name: 'Agent',
        email: 'demo@example.com',
        phone: '+1234567890',
        send_bird_id: 'demo_agent'
      };

      return {
        ...property,
        agent_first_name: agentData.first_name,
        agent_last_name: agentData.last_name,
        agent_email: agentData.email,
        agent_phone: agentData.phone,
        agent_send_bird_id: agentData.send_bird_id
      };
    } catch (error) {
      throw new Error(`Failed to fetch property: ${error.message}`);
    }
  }

  // Update property (agent only)
  async updateProperty(propertyId, agentUserId, updateData) {
    try {
      const propertyIndex = mockProperties.findIndex(p => p.id === propertyId);
      
      if (propertyIndex === -1) {
        throw new Error('Property not found');
      }

      const property = mockProperties[propertyIndex];
      
      if (property.agent_user_id !== agentUserId) {
        throw new Error('Unauthorized to update this property');
      }

      const updatedProperty = {
        ...property,
        ...updateData,
        updated_at: new Date()
      };

      mockProperties[propertyIndex] = updatedProperty;

      return updatedProperty;
    } catch (error) {
      throw new Error(`Failed to update property: ${error.message}`);
    }
  }

  // Delete property (agent only)
  async deleteProperty(propertyId, agentUserId) {
    try {
      const propertyIndex = mockProperties.findIndex(p => p.id === propertyId);
      
      if (propertyIndex === -1) {
        throw new Error('Property not found');
      }

      const property = mockProperties[propertyIndex];
      
      if (property.agent_user_id !== agentUserId) {
        throw new Error('Unauthorized to delete this property');
      }

      mockProperties.splice(propertyIndex, 1);

      return { message: 'Property deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete property: ${error.message}`);
    }
  }
}

export { PropertyServiceMock }; 