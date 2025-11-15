import random

CEREBRAS_API_KEYS = [
    'csk-c9ddc69fd3pk9jj3py24jmhydft6c2ymmdk59tyt6em6derk',
    'csk-nrtfnn56xmvkyckdt9nwn3rh8ef8vwx9xxktvxwmk6yxw566',
    'csk-hrtwc24p9mtw48m4dmvf95j4xx539nth4y63wxympjhkdhfp',
    'csk-4r22m82n6pve9ywhd9hkpdneek6t52keethr5dn66jpw6fyw',
    'csk-wp589vwjn2hfhnxhv9rwyj54tnpexc6yfxev5en9x6ffej5m',
    'csk-6232phepe8nxn25vrwjenf2p9mpke9txvw6pjjd6jx8reh2n',
    'csk-4f9vfnrkmd898h5dyr98y8j2ftnjhvhee322mvy8tmhnfthh',
    'csk-mennk8jmdnxptr4r56xv9mc95t9vwjpwhhnr54jhp4382wjt'
]


class APIKeyRotator:
    """Load balancer for Cerebras API keys using round-robin rotation"""
    
    def __init__(self):
        self.keys = CEREBRAS_API_KEYS.copy()
        self.current_index = 0
    
    def get_next_key(self):
        """Get next API key (round-robin load balancing)"""
        key = self.keys[self.current_index]
        self.current_index = (self.current_index + 1) % len(self.keys)
        return key
    
    def get_random_key(self):
        """Get random API key"""
        return random.choice(self.keys)


# Global instance for use across modules
key_rotator = APIKeyRotator()
