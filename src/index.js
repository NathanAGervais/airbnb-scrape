import axios from 'axios';

const getAmenities = (listOfAmenities, availableAmenityIds) => {
  return listOfAmenities
    .map(a => ({
      name: a.name,
      id: a.id
    }))
    .filter(loa => availableAmenityIds.includes(loa.id));
};

const mapData = data => {
  const { pdp_listing_detail: listing } = data;
  const availableAmenityIds =
    listing.root_amenity_sections.find(l => l.id === 'available_amenities')
      .amenity_ids || [];

  return {
    name: listing.name,
    amenities: getAmenities(listing.listing_amenities, availableAmenityIds),
    propertyType: listing.room_and_property_type || '',
    bathrooms: listing.bathroom_label || '',
    bedroom: listing.bedroom_label || '',
    id: listing.id
  };
};

const getListingId = url => url.match(/\d{6,}/g);

const getListings = async urls => {
  let currentListingId;
  const requests = urls.map(url => {
    currentListingId = getListingId(url);
    return axios
      .get(
        `https://www.airbnb.co.uk/api/v2/pdp_listing_details/${currentListingId}?_format=for_rooms_show&key=d306zoyjsyarp7ifhu67rjxn52tv0t20&`
      )
      .then(
        response => ({ response }),
        err => ({ err })
      );
  });
  return axios
    .all(requests)
    .then(
      axios.spread((...args) => {
        return args;
      })
    )
    .catch(err => {
      throw err;
    });
};

const getListingData = async urls => {
  const listingData = await getListings(urls);
  const responses = listingData
    .filter(l => l['response'] !== undefined)
    .map(li => {
      return mapData(li.response.data);
    });
  const errors = listingData
    .filter(l => l['err'] !== undefined)
    .map(error => {
      return {
        id: getListingId(error.err.config.url)[0] || '',
        message: error.err.message
      };
    });

  const results = [{ listings: responses }, { errors }];
  console.log(JSON.stringify(results, null, 4));
};

getListingData([
  'https://www.airbnb.co.uk/rooms/14531512?s=51',
  'https://www.airbnb.co.uk/rooms/19278160?s=51',
  'https://www.airbnb.co.uk/rooms/1939240?s=51'
]);
