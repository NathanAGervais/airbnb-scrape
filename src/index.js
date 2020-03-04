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
  const availableAmenityIds =
    data.root_amenity_sections.find(l => l.id === 'available_amenities')
      .amenity_ids || [];

  return {
    name: data.name,
    amenities: getAmenities(data.listing_amenities, availableAmenityIds),
    propertyType: data.room_and_property_type || '',
    bathrooms: data.bathroom_label || ''
  };
};

const getListings = url => {
  const listingId = url.match(/\d{8}/g);
  return axios
    .get(
      `https://www.airbnb.co.uk/api/v2/pdp_listing_details/${listingId}?_format=for_rooms_show&key=d306zoyjsyarp7ifhu67rjxn52tv0t20&`
    )
    .then(response => {
      const {
        data: { pdp_listing_detail: listing }
      } = response;

      return mapData(listing);
    })
    .catch(error => {
      if (error.response.status === 404) {
        console.log(`Listing with listing id: ${listingId} not found.`);
      }
      if (error.response.status === 503) {
        console.log(
          `Unable to process listing with id: ${listingId}, Service is currently unavailable`
        );
      }
    });
};

async function getListingData(url) {
  const listingData = await getListings(url);

  console.log(listingData);
}

getListingData('https://www.airbnb.co.uk/rooms/19278160?s=51');
