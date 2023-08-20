import PropTypes from 'prop-types';

function ReservationItem({ reservation }) {
  return (
    <li key={reservation.id} className="border border-gray-200 rounded p-4">
      <p>Date: {reservation.reserve_date}</p>
      <p>City: {reservation.city}</p>
    </li>
  );
}

ReservationItem.propTypes = {
  reservation: PropTypes.object.isRequired,
};

export default ReservationItem;
